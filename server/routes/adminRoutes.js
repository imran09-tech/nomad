const express = require('express');
const router = express.Router();
const { authenticateToken, restrictTo } = require('../middleware/auth');
const { getAdminBookings, verifyBookingPayment } = require('../controllers/bookingController');
const { getAdminUsers, updateUserRole, deleteUser, getAdminStats } = require('../controllers/adminController');

router.get('/bookings', authenticateToken, restrictTo('admin'), getAdminBookings);
router.put('/bookings/:id/verify', authenticateToken, restrictTo('admin'), verifyBookingPayment);
router.get('/users', authenticateToken, restrictTo('admin'), getAdminUsers);
router.put('/users/:id/role', authenticateToken, restrictTo('admin'), updateUserRole);
router.delete('/users/:id', authenticateToken, restrictTo('admin'), deleteUser);
router.get('/stats', authenticateToken, restrictTo('admin'), getAdminStats);

module.exports = router;
