const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const startMarker = "//  BOOKINGS & PAYMENTS ROUTES";
const endMarker = "//  FEEDBACK ROUTES";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    let actualStart = code.lastIndexOf('\n', startIndex);
    let actualEnd = code.lastIndexOf('\n', code.lastIndexOf('\n', endIndex) - 1) - 40; // adjusting for the dashed line above it
    
    // Find the real actual end (the dashed line above FEEDBACK ROUTES)
    actualEnd = code.lastIndexOf('// ─────────────────────────────────────────────', endIndex) - 1;

    let chunk = code.substring(actualStart, actualEnd);
    
    // Replace app.method( with router.method(
    chunk = chunk.replace(/app\.(post|get|put|patch|delete)/g, 'router.$1');
    // Replace '/api/create-payment-intent' with '/create-payment-intent'
    chunk = chunk.replace(/\/api\/create-payment-intent/g, '/create-payment-intent');
    // Replace '/api/bookings/something' with '/something'
    chunk = chunk.replace(/\/api\/bookings\//g, '/');
    // Replace '/api/bookings' with '/'
    chunk = chunk.replace(/'\/api\/bookings'/g, '\'/\'');
    chunk = chunk.replace(/"\/api\/bookings"/g, '"/"');

    const prefix = `const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { dbGet, dbRun, dbAll } = require('../config/database');
const { authenticateToken, authenticateOptional } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { createPaymentIntent } = require('../controllers/paymentController');
const { calculateSplitPayment, buildLedgerEntry } = require('../controllers/paymentSplitter');
const {
  createBooking,
  createDirectTransferBooking,
  getUserBookings,
  getBookingById,
  updateGuestInfo,
  uploadScreenshot,
  getBookingStatus,
} = require('../controllers/bookingController');
const rateLimit = require('express-rate-limit');

// Dedicated limiter for webhook
const WEBHOOK_RATE_LIMIT = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many webhook calls.' },
});

`;

    const postfix = `\nmodule.exports = router;\n`;

    fs.writeFileSync('server/routes/bookingRoutes.js', prefix + chunk + postfix);
    
    const replacement = `\n// ─── Bookings & Payments Module ─────────────────────────────\napp.use('/api/bookings', require('./routes/bookingRoutes'));\n// Also map create-payment-intent to this router for backward compatibility\napp.use('/api/create-payment-intent', (req, res, next) => {\n  req.url = '/create-payment-intent';\n  require('./routes/bookingRoutes')(req, res, next);\n});\n\n`;
    
    code = code.substring(0, actualStart) + replacement + code.substring(actualEnd);
    
    fs.writeFileSync('server/index.js', code);
    console.log("Successfully extracted Booking routes!");
} else {
    console.error("Could not find markers!");
}
