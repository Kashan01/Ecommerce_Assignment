const Order = require('../models/Order');
const AppError = require('../utils/AppError');

exports.processPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return next(new AppError('Order not found', 404));
    if (order.status !== 'PENDING') return next(new AppError('Order already processed', 400));

//DUMMY PAYMENT BOOLEAN 90% WILL BE SUCCESSFUL
    const isSuccess = Math.random() > 0.1; 

    if (!isSuccess) {
      return next(new AppError('Payment Failed', 402));
    }

    // PAYMENT CONFIRM
    order.status = 'CONFIRMED';
    order.paymentId = `PAY_${Date.now()}`;
    await order.save();

    res.status(200).json({ status: 'success', data: order });

  } catch (err) {
    next(err);
  }
};