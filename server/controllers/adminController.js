const { dbGet, dbAll, dbRun } = require('../config/database');

exports.getAdminUsers = async (req, res, next) => {
    try {
        const users = await dbAll(
            'SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['user', 'vendor', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified.' });
        }
        await dbRun('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ success: true, message: `User role updated to ${role}.` });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (parseInt(id, 10) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own active admin account.' });
        }
        await dbRun('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (err) {
        next(err);
    }
};

exports.getAdminStats = async (req, res, next) => {
    try {
        const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users');
        const totalBookings = await dbGet(
            'SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as total_revenue FROM bookings'
        );
        const pendingBookings = await dbGet(
            'SELECT COUNT(*) as count FROM bookings WHERE status IN ("PENDING", "AWAITING_CONFIRMATION")'
        );
        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers ? totalUsers.count : 0,
                totalBookings: totalBookings ? totalBookings.count : 0,
                totalRevenue: totalBookings ? totalBookings.total_revenue : 0,
                pendingBookings: pendingBookings ? pendingBookings.count : 0,
            },
        });
    } catch (err) {
        next(err);
    }
};
