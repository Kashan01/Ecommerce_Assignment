const express = require('express');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController'); // <--- 1. Import Payment Controller
const router = express.Router();

//1. order create
router.post('/', orderController.createOrder);

// 2. Get order
router.get('/', orderController.getMyOrders);

// 3. Refund Order
router.post('/:id/refund', orderController.refundOrder);

// Payment 
router.post('/pay', paymentController.processPayment);

module.exports = router;