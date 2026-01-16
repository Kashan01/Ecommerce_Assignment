const orderService = require('../services/orderService');
const refundService = require('../services/refundService');
const User = require('../models/User'); 
const Order = require('../models/Order'); 
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');


 //1. CREATING ORDER

exports.createOrder = catchAsync(async (req, res, next) => {
  let { userId, email, cartItems } = req.body;

  // 2 FINDING BY ID
  if (!userId && email) {
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return next(new AppError(`User with email '${email}' not found. Please Register first!`, 404));
    }
    
    userId = user._id;
  }

  if (!userId) {
     return next(new AppError('User ID or Email is required to place an order', 400));
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return next(new AppError('Cart cannot be empty', 400));
  }


  const order = await orderService.createOrder(userId, cartItems);

  res.status(201).json({
    status: 'success',
    data: { order }
  });
});


exports.getMyOrders = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(new AppError('Please provide an email to fetch orders', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ status: 'success', results: 0, data: { orders: [] } });
  }

  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

//REFUND SECTION
exports.refundOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await refundService.processRefund(orderId);

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});