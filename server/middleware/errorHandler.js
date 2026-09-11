/**
 * /src/middleware/errorHandler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized, production-hardened error handler.
 *
 * Features:
 *  - Uniform JSON shape: { success, message, details? }
 *  - Suppresses stack traces & internal details in production
 *  - Maps Stripe, JWT, and DB errors to meaningful HTTP status codes
 *  - Never leaks system internals to the client
 * ─────────────────────────────────────────────────────────────────────────────
 */

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Map known error types → human-readable message + HTTP status.
 * Order matters: more specific checks first.
 */
function classifyError(err) {
  // ── Zod / validation errors (set by validate.js middleware) ──────────────
  if (err.statusCode === 400 && err.details) {
    return { status: 400, message: err.message || 'Validation failed', details: err.details };
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return { status: 401, message: 'Invalid token. Please log in again.' };
  }
  if (err.name === 'TokenExpiredError') {
    return { status: 401, message: 'Session expired. Please log in again.' };
  }

  // ── Stripe errors (https://stripe.com/docs/error-codes) ──────────────────
  if (err.type && err.type.startsWith('Stripe')) {
    switch (err.type) {
      case 'StripeCardError':
        return { status: 402, message: err.message }; // safe to expose
      case 'StripeRateLimitError':
        return { status: 429, message: 'Payment service busy. Please retry shortly.' };
      case 'StripeInvalidRequestError':
        return { status: 400, message: IS_PROD ? 'Invalid payment request.' : err.message };
      case 'StripeAuthenticationError':
        return { status: 500, message: 'Payment configuration error. Contact support.' };
      case 'StripeConnectionError':
      case 'StripeAPIError':
      default:
        return { status: 502, message: 'Payment service unavailable. Please try again.' };
    }
  }

  // ── SQLite constraint violations ──────────────────────────────────────────
  if (err.code === 'SQLITE_CONSTRAINT') {
    // Usually a UNIQUE constraint
    return { status: 409, message: 'A record with this information already exists.' };
  }
  if (err.code && err.code.startsWith('SQLITE_')) {
    return { status: 500, message: 'Database error. Please try again.' };
  }

  // ── SyntaxError (malformed JSON body) ────────────────────────────────────
  if (err instanceof SyntaxError && err.status === 400) {
    return { status: 400, message: 'Invalid JSON in request body.' };
  }

  // ── CORS errors ────────────────────────────────────────────────────────────
  if (err.message && err.message.includes('Not allowed by CORS')) {
    return { status: 403, message: 'Cross-origin request blocked.' };
  }

  // ── Operational errors (thrown intentionally by route handlers) ───────────
  if (err.isOperational) {
    return { status: err.statusCode || 400, message: err.message };
  }

  // ── Fallback for any explicit statusCode set by route handlers ────────────
  if (err.statusCode && err.statusCode < 500) {
    return { status: err.statusCode, message: err.message || 'Request error.' };
  }

  // ── Default: generic 500 ──────────────────────────────────────────────────
  return {
    status: 500,
    message: IS_PROD
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Unknown server error',
  };
}

/**
 * Global error handler — must be registered LAST in Express middleware chain.
 * Signature must have 4 parameters for Express to recognise it as error middleware.
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  // Always log the full error server-side (switch to a logger like winston/pino in prod)
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    message: err.message,
    stack: IS_PROD ? '(suppressed in prod)' : err.stack,
  });

  const { status, message, details } = classifyError(err);

  const body = { success: false, message };
  if (details) body.details = details;
  // Attach stack only in development — never in production
  if (!IS_PROD && err.stack) body._stack = err.stack;

  res.status(status).json(body);
};

/**
 * asyncHandler(fn)
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps an async route handler so any rejected promise is automatically
 * forwarded to the global error handler via next(err).
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 *
 * This eliminates every try/catch boilerplate in route handlers.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * createError(message, statusCode)
 * Convenience factory for operational errors.
 */
const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};

module.exports = { globalErrorHandler, asyncHandler, createError };
