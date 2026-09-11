const express = require('express');
const router = express.Router();
const {
  getLiveStationTrains,
  getStationSuggestions,
  getTrainsBetweenStations,
  getPNRStatus,
} = require('../controllers/trainController');

// Using dummy protectRoute for development
let protectRoute;
try {
  const auth = require('../middleware/auth');
  protectRoute = auth.authenticateToken;
} catch (e) {
  protectRoute = (req, res, next) => next();
}

router.route('/live').get(protectRoute, getLiveStationTrains);
router.route('/suggest').get(protectRoute, getStationSuggestions);
router.route('/search').get(protectRoute, getTrainsBetweenStations);
router.route('/pnr').get(protectRoute, getPNRStatus);

module.exports = router;
