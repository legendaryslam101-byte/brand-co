const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { toPublicUser } = require('./auth.controller');

const getProfile = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!rows.length) throw new ApiError(404, 'Customer not found');
  res.json({ user: toPublicUser(rows[0]) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const { rows } = await query(
    `UPDATE users SET
       name       = COALESCE($1, name),
       phone      = COALESCE($2, phone),
       updated_at = now()
     WHERE id = $3
     RETURNING id, email, name, phone, role`,
    [name ?? null, phone ?? null, req.user.id]
  );

  if (!rows.length) throw new ApiError(404, 'Customer not found');
  res.json({ user: toPublicUser(rows[0]) });
});

// Order history for the signed-in customer.
const getOrders = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT id, order_number, status, subtotal, delivery_fee, total, currency, created_at
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ orders: rows });
});

module.exports = { getProfile, updateProfile, getOrders };
