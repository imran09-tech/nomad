const rateLimit = require('express-rate-limit');

// 1. Authentication Limiter
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 login/register attempts per minute
  message: { error: 'Too many authentication attempts. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. General API Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 150 requests per window
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Dedicated limiter for property search (CM APIs are paid-per-call)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many search requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Dedicated limiter for channel manager webhook inbound
const webhookCMLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many webhook requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. Reserve endpoint is per-user 10/min (booking frequency limit)
const reserveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id?.toString() || req.socket.remoteAddress,
  validate: false,
  message: { error: 'Too many booking attempts. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
  searchLimiter,
  webhookCMLimiter,
  reserveLimiter
};
