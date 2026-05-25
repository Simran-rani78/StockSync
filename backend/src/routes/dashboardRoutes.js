const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Dashboard statistics routing - requires Admin privileges
router.get('/stats', authenticateToken, requireRole('Admin'), dashboardController.getDashboardStats);

module.exports = router;
