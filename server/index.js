const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || '',
  },
});
const twilio = require('twilio');
let twilioClient = null;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (
  accountSid &&
  accountSid.startsWith('AC') &&
  authToken &&
  !authToken.includes('placeholder') &&
  !authToken.includes('here')
) {
  twilioClient = twilio(accountSid, authToken);
}

const { initializeDatabase, dbRun, dbGet, dbAll } = require('./config/database');

// ── Modular Middleware ────────────────────────────────────────────────────────
const { globalErrorHandler, asyncHandler, createError } = require('./middleware/errorHandler');
const { validate, schemas } = require('./middleware/validate');
const {
  authenticateToken: authMiddleware,
  authenticateOptional,
  restrictTo,
} = require('./middleware/auth');

// ── Modular Controllers ───────────────────────────────────────────────────────
const { createPaymentIntent, stripeWebhook } = require('./controllers/paymentController');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  updateGuestInfo,
  createDirectTransferBooking,
  getAdminBookings,
  verifyBookingPayment,
  uploadScreenshot,
  getBookingStatus,
} = require('./controllers/bookingController');

// ── Multi-Vendor Payout Architecture ────────────────────────────────────────
const { calculateSplitPayment, buildLedgerEntry } = require('./controllers/paymentSplitter');
const vendorRouterModule = require('./routes/vendors');

// ── Channel Manager / GDS Integration Layer ──────────────────────────────
const propertiesRouterModule = require('./routes/properties');
const channelWebhookRouterModule = require('./routes/channelWebhook');
const transitRoutes = require('./routes/transitRoutes');
const trainRoutes = require('./routes/trainRoutes');

// --- Guard: Fail fast if critical env vars are missing ---
const REQUIRED_ENV = ['JWT_SECRET', 'STRIPE_SECRET_KEY', 'GEMINI_API_KEY'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(
      `[FATAL] Missing required environment variable: ${key}. Add it to your .env file.`
    );
    process.exit(1);
  }
});

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5000';

// ─────────────────────────────────────────────
//  SECURITY MIDDLEWARE
// ─────────────────────────────────────────────

// 1. Helmet: sets secure HTTP headers automatically
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP to allow inline event handlers & scripts in local dev
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false, // Allow media (videos/images) to be loaded cross-origin
  })
);

// 2. CORS: allow local development port 8080 alongside client origin
app.use(
  cors({
    origin: true, // Allow all origins for dev/local testing
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));

// ── Static Assets Middleware ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/pic', express.static(path.join(__dirname, '../pic')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// ── Raw body capture for Stripe webhook signature verification ────────────────
// MUST come BEFORE express.json() for the webhook route only.
// We save the raw Buffer on req so stripe.webhooks.constructEvent() can verify
// the HMAC signature. If we run it through JSON parsing first, the signature fails.
app.use('/api/bookings/checkout-success', express.raw({ type: 'application/json' }));

// 3. Rate Limiters
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 login/register attempts per minute
  message: { error: 'Too many authentication attempts. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 150 requests per window
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiters
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Dedicated limiter for property search (CM APIs are paid-per-call)
// 20 searches/min per IP is generous for human use, restrictive for scrapers.
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many search requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/properties/search', searchLimiter);

// Dedicated limiter for channel manager webhook inbound
// 120/min covers CM batch-flush events; higher than general API.
const webhookCMLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many webhook requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/webhooks/channel-manager', webhookCMLimiter);

// Reserve endpoint is per-user 10/min (booking frequency limit)
const reserveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id?.toString() || req.socket.remoteAddress,
  validate: false,
  message: { error: 'Too many booking attempts. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/webhooks/channel-manager/reserve', reserveLimiter);

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '../public')));
app.use('/pic', express.static(path.join(__dirname, '../pic')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Destination Video Upload & Range-Streaming Layer ────────────────────────
const videoUploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads', 'videos')
  : path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `video-${req.params.id || 'dest'}-${uniqueSuffix}${ext}`);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v', '.flv'];
    if (file.mimetype.startsWith('video/') || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (.mp4, .webm, .mov, .avi, .mkv) are allowed.'));
    }
  },
});

// POST /api/destinations/:id/video - Upload video into disk & SQLite nomad.db
app.post('/api/destinations/:id/video', (req, res, next) => {
  videoUpload.single('video')(req, res, async (err) => {
    if (err) {
      console.error('[Video Upload Error]', err);
      return res.status(400).json({ success: false, error: err.message || 'Video upload failed.' });
    }

    try {
      let destinationId = parseInt(req.params.id, 10);
      if (isNaN(destinationId) && req.params.id) {
        const match = String(req.params.id).match(/\d+/);
        if (match) destinationId = parseInt(match[0], 10);
      }
      if (isNaN(destinationId)) {
        return res.status(400).json({ success: false, error: 'Invalid destination ID.' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No video file uploaded.' });
      }

      // Public URL path served via static express middleware
      const videoUrl = `/uploads/videos/${req.file.filename}`;
      const videoMime = req.file.mimetype || 'video/mp4';

      // Read small buffer (<5MB) for SQLite BLOB storage to prevent memory overflow
      let videoBuffer = null;
      if (req.file.size < 5 * 1024 * 1024) {
        try {
          videoBuffer = fs.readFileSync(req.file.path);
        } catch (_) {}
      }

      // Upsert into SQLite nomad.db file
      const existing = await dbGet('SELECT id FROM destinations WHERE id = ?', [destinationId]);
      if (existing) {
        await dbRun(
          'UPDATE destinations SET video_blob = ?, video_mime = ?, video_url = ? WHERE id = ?',
          [videoBuffer, videoMime, videoUrl, destinationId]
        );
      } else {
        await dbRun(
          'INSERT INTO destinations (id, name, type, location_text, video_blob, video_mime, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            destinationId,
            `Destination #${destinationId}`,
            'destination',
            'Global',
            videoBuffer,
            videoMime,
            videoUrl,
          ]
        );
      }

      console.log(`[Video Saved] Destination ID ${destinationId} -> ${videoUrl}`);

      res.json({
        success: true,
        message: 'Video uploaded and saved to local database successfully.',
        videoUrl: videoUrl,
        destinationId: destinationId,
      });
    } catch (dbErr) {
      console.error('[Video DB Save Error]', dbErr);
      res
        .status(500)
        .json({ success: false, error: 'Failed to save video to database: ' + dbErr.message });
    }
  });
});
// ─── Destination Image Upload Layer ────────────────────────
const imageUploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads', 'images')
  : path.join(__dirname, '../uploads/images');
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// Serve static uploaded images
app.use('/uploads/images', express.static(imageUploadDir));

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `image-${req.params.id || 'dest'}-${uniqueSuffix}${ext}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (file.mimetype.startsWith('image/') || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (.jpg, .jpeg, .png, .webp, .gif) are allowed.'));
    }
  },
});

// POST /api/destinations/:id/image - Upload image and update SQLite nomad.db
app.post('/api/destinations/:id/image', (req, res, next) => {
  imageUpload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('[Image Upload Error]', err);
      return res.status(400).json({ success: false, error: err.message || 'Image upload failed.' });
    }

    try {
      let destinationId = parseInt(req.params.id, 10);
      if (isNaN(destinationId) && req.params.id) {
        const match = String(req.params.id).match(/\d+/);
        if (match) destinationId = parseInt(match[0], 10);
      }
      if (isNaN(destinationId)) {
        return res.status(400).json({ success: false, error: 'Invalid destination ID.' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image file uploaded.' });
      }

      // Public URL path served via static express middleware
      const imageUrl = `/uploads/images/${req.file.filename}`;

      // Update into SQLite nomad.db file
      const existing = await dbGet('SELECT id FROM destinations WHERE id = ?', [destinationId]);
      if (existing) {
        await dbRun('UPDATE destinations SET image = ? WHERE id = ?', [imageUrl, destinationId]);
      } else {
        await dbRun(
          'INSERT INTO destinations (id, name, type, location_text, image) VALUES (?, ?, ?, ?, ?)',
          [destinationId, `Destination #${destinationId}`, 'destination', 'Global', imageUrl]
        );
      }

      console.log(`[Image Saved] Destination ID ${destinationId} -> ${imageUrl}`);

      res.json({
        success: true,
        message: 'Image uploaded and saved to local database successfully.',
        imageUrl: imageUrl,
        destinationId: destinationId,
      });
    } catch (dbErr) {
      console.error('[Image DB Save Error]', dbErr);
      res
        .status(500)
        .json({ success: false, error: 'Failed to save image to database: ' + dbErr.message });
    }
  });
});

// ─────────────────────────────────────────────
//  AUTH MIDDLEWARE (modular — see src/middleware/auth.js)
// ─────────────────────────────────────────────
// Re-export for legacy inline routes still in this file
const authenticateToken = authMiddleware;

// Simple XSS sanitizer for user input (still used by legacy inline routes)
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ── Mount Vendor / Partner Router ────────────────────────────────────────────
// Inject shared dependencies AFTER middleware is defined to avoid undefined refs.
vendorRouterModule.init({ dbRun, dbGet, dbAll, authenticateToken, sanitize, stripe });
app.use('/api/vendors', vendorRouterModule.router);

// ── Mount Channel Manager / GDS Routers ─────────────────────────────────────
propertiesRouterModule.init({ authenticateToken, dbRun, dbGet, dbAll });
app.use('/api/properties', propertiesRouterModule.router);

channelWebhookRouterModule.init({ dbRun, dbGet, dbAll, authenticateToken, sanitize, stripe });
app.use('/api/webhooks/channel-manager', channelWebhookRouterModule.router);

// ── Mount Transit Router ────────────────────────────────────────────────────
app.use('/api/v1/transit', transitRoutes);
app.use('/api/v1/trains', trainRoutes);
app.use('/api/v1/train', trainRoutes);

// ── Mount P2P Crypto Trading Router ──────────────────────────────────────────
const p2pRouter = require('./routes/p2pRoutes');
app.use('/api/v1/p2p', p2pRouter);

// ─────────────────────────────────────────────
//  AUTHENTICATION ROUTES
// ─────────────────────────────────────────────

// ─── Auth Module ─────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));



// ─── User Module ─────────────────────────────
app.use('/api/users', require('./routes/userRoutes'));



// DELETE /api/destinations/:id/video - Delete video from database & disk
app.delete('/api/destinations/:id/video', async (req, res, next) => {
  try {
    let id = parseInt(req.params.id, 10);
    if (isNaN(id) && req.params.id) {
      const match = String(req.params.id).match(/\d+/);
      if (match) id = parseInt(match[0], 10);
    }
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid destination ID.' });
    }

    const row = await dbGet('SELECT video_url FROM destinations WHERE id = ?', [id]);
    if (row && row.video_url && row.video_url.startsWith('/uploads/videos/')) {
      const filePath = path.join(__dirname, '..', row.video_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }

    await dbRun(
      'UPDATE destinations SET video_url = NULL, video_blob = NULL, video_mime = NULL WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Video deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/:id/video - Stream video (Disk file preferred, BLOB fallback) with HTTP Range support
app.get('/api/destinations/:id/video', async (req, res, next) => {
  try {
    let id = parseInt(req.params.id, 10);
    if (isNaN(id) && req.params.id) {
      const match = String(req.params.id).match(/\d+/);
      if (match) id = parseInt(match[0], 10);
    }
    if (isNaN(id)) {
      return res.status(400).send('Invalid ID');
    }

    const row = await dbGet(
      'SELECT video_url, video_blob, video_mime FROM destinations WHERE id = ?',
      [id]
    );
    if (!row || (!row.video_blob && !row.video_url)) {
      return res.status(404).send('Video not found');
    }

    // Disk file streaming check
    if (row.video_url && row.video_url.startsWith('/uploads/videos/')) {
      const filePath = path.join(__dirname, '..', row.video_url);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    if (!row.video_blob) {
      return res.status(404).send('Video data missing');
    }

    const videoBuffer = row.video_blob;
    const totalLength = videoBuffer.length;
    const mimeType = row.video_mime || 'video/mp4';

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

      if (start >= totalLength || end >= totalLength) {
        res.writeHead(416, { 'Content-Range': `bytes */${totalLength}` });
        return res.end();
      }

      const chunksize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });
      res.end(videoBuffer.subarray(start, end + 1));
    } else {
      res.writeHead(200, {
        'Content-Length': totalLength,
        'Content-Type': mimeType,
      });
      res.end(videoBuffer);
    }
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// ─── Admin Module ─────────────────────────────
app.use('/api/admin', require('./routes/adminRoutes'));

// ─── Bookings & Payments Module ─────────────────────────────
app.use('/api/bookings', require('./routes/bookingRoutes'));
// Also map create-payment-intent to this router for backward compatibility
app.use('/api/create-payment-intent', (req, res, next) => {
  req.url = '/create-payment-intent';
  require('./routes/bookingRoutes')(req, res, next);
});


// ─── Feedback & Chat Module ─────────────────────────────
app.use('/api', require('./routes/feedbackRoutes'));


// ─────────────────────────────────────────────
//  GLOBAL ERROR HANDLER — modular, production-hardened
//  see src/middleware/errorHandler.js for full classification logic
// ─────────────────────────────────────────────
app.use(globalErrorHandler);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// ─────────────────────────────────────────────
//  START SERVER OR EXPORT FOR SERVERLESS
// ─────────────────────────────────────────────

if (process.env.VERCEL) {
  // If running on Vercel, we need to initialize the database synchronously or handle it gracefully,
  // then export the app for the serverless function.
  initializeDatabase().catch((err) => console.error('DB Init Error:', err));
  module.exports = app;
} else {
  // Local development or standard VPS hosting
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✅ IMXX Server running on http://localhost:${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   CORS origin: ${CLIENT_ORIGIN}`);
      });
    })
    .catch((err) => {
      console.error('[FATAL] Database initialization failed:', err);
      process.exit(1);
    });
}
