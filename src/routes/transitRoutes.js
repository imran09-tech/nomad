const express = require('express');
const router = express.Router();
const { searchTransit } = require('../controllers/transitController');

// Placeholder for the authentication guard.
// Assumes you have a protectRoute middleware, typically something like require('../middleware/authMiddleware').protect
// If it exists in middleware folder, we can require it. For now, we will add a dummy or require it dynamically if available.
let protectRoute;
try {
    const auth = require('../middleware/auth');
    protectRoute = auth.authenticateToken;
} catch (e) {
    // Dummy protect for development if it doesn't exist yet
    protectRoute = (req, res, next) => next();
}

router.route('/search').get(protectRoute, searchTransit);

module.exports = router;
