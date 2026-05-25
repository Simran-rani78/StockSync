const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Order routing - authenticated users can read/write, Admin and Staff can change order status
router.get('/', authenticateToken, orderController.getOrders);
router.post('/', authenticateToken, orderController.createOrder);
router.put('/:id/status', authenticateToken, requireRole(['Admin', 'Staff']), orderController.updateOrderStatus);

module.exports = router;
