const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbGet, dbRun } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Setup multer for avatar uploads
const upload = multer({ dest: path.join(__dirname, '../../public/assets/uploads/') });


// Update Profile
router.put('/api/user/profile', authenticateToken, async (req, res, next) => {
  const { fullName, username, email, currency, phoneNumber } = req.body;

  if (!fullName || !username || !email) {
    return res.status(400).json({ error: 'Full name, username, and email are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const allowedCurrencies = ['USD', 'EUR', 'INR', 'GBP', 'AED'];
  const safeCurrency = allowedCurrencies.includes(currency) ? currency : 'USD';

  try {
    const otherUser = await dbGet(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email.toLowerCase(), username, req.user.id]
    );
    if (otherUser) {
      return res
        .status(409)
        .json({ error: 'Email or username is already taken by another account.' });
    }

    await dbRun(
      'UPDATE users SET full_name = ?, username = ?, email = ?, currency = ?, phone_number = ? WHERE id = ?',
      [
        sanitize(fullName),
        sanitize(username),
        email.toLowerCase(),
        safeCurrency,
        sanitize(phoneNumber || ''),
        req.user.id,
      ]
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// Update Avatar URL
router.post('/api/user/avatar', authenticateToken, async (req, res, next) => {
  const { avatarUrl } = req.body;
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return res.status(400).json({ error: 'A valid avatar URL is required.' });
  }

  try {
    await dbRun('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ message: 'Avatar updated successfully.', avatarUrl });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
//  DESTINATIONS & CATALOG ROUTES
// ─────────────────────────────────────────────
let imageMapping = {};
try {
  imageMapping = require('../../scripts/image_mapping.json');
} catch (err) {
  console.error('Failed to load scripts/image_mapping.json:', err);
}

function getCorrectImagePath(dbImage) {
  if (!dbImage) return dbImage;
  if (
    dbImage.startsWith('http://') ||
    dbImage.startsWith('https://') ||
    dbImage.startsWith('//') ||
    dbImage.startsWith('assets/')
  ) {
    return dbImage;
  }
  if (imageMapping[dbImage]) {
    const mapped = imageMapping[dbImage];
    if (mapped.startsWith('images/')) {
      return 'assets/' + mapped;
    }
    return mapped;
  }

  // Fallback regex heuristics for safety
  const numberMatch = dbImage.match(/\d+/);
  const numberStr = numberMatch ? numberMatch[0] : '';
  const ext = dbImage.endsWith('.png') ? '.png' : '.jpg';

  if (dbImage.startsWith('destination/')) {
    return `assets/images/travel/luxury-destination-vacation-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('hotel/')) {
    return `assets/images/hotels/premium-hotel-suite-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('nature/')) {
    return `assets/images/travel/beautiful-nature-landscape-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('mountain/')) {
    return `assets/images/travel/scenic-mountain-view-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('planets/')) {
    return `assets/images/travel/stargazing-experience-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('sea/')) {
    return `assets/images/travel/ocean-beach-resort-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('college/')) {
    return `assets/images/banners/nomad-travel-${numberStr}${ext}`;
  }

  return dbImage;
}

router.get('/api/destinations', async (req, res, next) => {
  const { type, query } = req.query;

  try {
    let sql = 'SELECT * FROM destinations';
    const params = [];

    if (type && type !== 'all') {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    if (query) {
      const hasWhere = type && type !== 'all';
      sql += hasWhere ? ' AND' : ' WHERE';
      sql += ' (name LIKE ? OR location_text LIKE ? OR data_location_tags LIKE ?)';
      const wildcard = `%${query.replace(/[%_]/g, '\\$&')}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    const rows = await dbAll(sql, params);
    const mappedRows = rows.map((row) => {
      if (row.image) {
        row.image = getCorrectImagePath(row.image);
      }
      return row;
    });
    res.json(mappedRows);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
