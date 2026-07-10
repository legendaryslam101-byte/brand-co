const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function toPublicUser(row) {
  return { id: row.id, email: row.email, name: row.name, phone: row.phone, role: row.role };
}

const register = asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    throw new ApiError(409, 'An account with that email already exists');
  }

  const passwordHash = await hashPassword(password);
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, name, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, phone, role`,
    [email, passwordHash, name, phone || null]
  );

  const user = rows[0];
  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ user: toPublicUser(user), token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  // Same error for "no such user" and "wrong password" so we don't leak
  // which accounts exist.
  if (!user || !(await comparePassword(password, user.password_hash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user: toPublicUser(user), token });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.cookieName);
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!rows.length) throw new ApiError(404, 'User not found');
  res.json({ user: toPublicUser(rows[0]) });
});

module.exports = { register, login, logout, me, toPublicUser };
