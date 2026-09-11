/**
 * /src/middleware/auth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * JWT authentication guard middleware.
 *
 * Reads the Bearer token from the Authorization header.
 * Attaches decoded { id, email } payload to req.user.
 * Calls next(err) on any auth failure so the globalErrorHandler formats it.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const jwt = require('jsonwebtoken');
const { createError } = require('./errorHandler');
const { dbGet } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * authenticateToken — protects any route that requires a logged-in user.
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(createError('Access denied. No token provided.', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Dynamically retrieve the user's current role from SQLite
    const dbUser = await dbGet('SELECT role FROM users WHERE id = ?', [decoded.id]);

    req.user = {
      ...decoded,
      role: dbUser ? dbUser.role : 'user',
    };

    next();
  } catch (err) {
    // Forward JWT-specific errors; globalErrorHandler maps them to 401
    next(err);
  }
};

/**
 * restrictTo(...roles) — limits access to users matching the given role(s).
 * Requires authenticateToken to have run first.
 *
 * Usage: router.use(authenticateToken, restrictTo('admin'))
 */
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(createError('Not authenticated.', 401));
    if (!roles.includes(req.user.role)) {
      return next(createError('Forbidden: insufficient permissions.', 403));
    }
    next();
  };

module.exports = { authenticateToken, restrictTo };

/**
 * authenticateOptional
 */
const authenticateOptional = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const { dbGet } = require('../config/database');
    const dbUser = await dbGet('SELECT role FROM users WHERE id = ?', [decoded.id]);
    req.user = { ...decoded, role: dbUser ? dbUser.role : 'user' };
  } catch (err) {}
  next();
};
module.exports.authenticateOptional = authenticateOptional;
