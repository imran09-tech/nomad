const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const p2pController = require('../controllers/p2pController');
const { authenticateOptional, authenticateToken } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif/;
  const isExtValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedExtensions.test(file.mimetype);
  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF) are allowed for transaction proof.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// P2P Routes
router.post('/trades', p2pController.createTrade);
router.post('/trades/:tradeId/submit-proof', upload.single('screenshot'), p2pController.submitPaymentProof);
router.post('/trades/:tradeId/verify', authenticateOptional, p2pController.verifyTradePayment);
router.get('/trades/:tradeId', p2pController.getTradeDetails);

module.exports = router;
