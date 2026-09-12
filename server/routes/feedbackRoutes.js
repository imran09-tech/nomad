const express = require('express');
const router = express.Router();
const { dbGet, dbRun, dbAll } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');


// ─────────────────────────────────────────────
//  FEEDBACK ROUTES
// ─────────────────────────────────────────────
router.post('/feedback', authenticateToken, async (req, res, next) => {
  const { category, rating, message } = req.body;

  if (!category || rating === undefined || !message) {
    return res.status(400).json({ error: 'Category, rating, and message are all required.' });
  }

  const ratingVal = parseInt(rating, 10);
  if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message must be under 2000 characters.' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO feedback (user_id, category, rating, message) VALUES (?, ?, ?, ?)',
      [req.user.id, sanitize(category), ratingVal, sanitize(message)]
    );

    // Async file write — does NOT block the event loop
    const feedbackFilePath = path.join(__dirname, 'feedback.json');
    let feedbackArray = [];
    try {
      const fileContent = await fs.promises.readFile(feedbackFilePath, 'utf8');
      feedbackArray = JSON.parse(fileContent || '[]');
    } catch (_) {
      /* File may not exist yet */
    }

    feedbackArray.push({
      id: result.lastID,
      user_id: req.user.id,
      user_email: req.user.email,
      category,
      rating: ratingVal,
      message,
      created_at: new Date().toISOString(),
    });

    // Fire-and-forget async write
    fs.promises
      .writeFile(feedbackFilePath, JSON.stringify(feedbackArray, null, 2), 'utf8')
      .catch((e) => console.error('[Feedback File Write Error]', e));

    res
      .status(201)
      .json({ message: 'Feedback submitted successfully. Thank you!', feedbackId: result.lastID });
  } catch (err) {
    next(err);
  }
});

router.get('/feedback', authenticateToken, async (req, res, next) => {
  try {
    const feedbackList = await dbAll(
      'SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(feedbackList);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
//  SECURE AI CHAT PROXY
// ─────────────────────────────────────────────
router.post('/chat', async (req, res, next) => {
  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction, contents }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini Proxy Error]', response.status, errorText);
      return res.status(response.status).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
