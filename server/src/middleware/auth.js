const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies && req.cookies[env.cookieName]) return req.cookies[env.cookieName];
  return null;
}

// Populates req.user if a valid token is present; never rejects the
// request. Used by routes (like the cart) that work for both guests and
// signed-in customers.
function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    // Invalid/expired token on an optional route just means "not logged in".
  }
  next();
}

// Rejects the request unless a valid token is present.
function requireAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next(new ApiError(401, 'Authentication required'));
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired session'));
  }
}

function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required'));
  }
  next();
}

module.exports = { optionalAuth, requireAuth, requireAdmin };
