const express = require('express');
const router = express.Router();
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Admin Order Management Endpoints
router.use(protect);
router.use(admin);

router.get('/', getAllOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
