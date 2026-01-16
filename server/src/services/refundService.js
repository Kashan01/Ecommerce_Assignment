const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

exports.processRefund = async (orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // looking for order
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError('Order not found', 404);

    if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
      throw new AppError('Order is already processed', 400);
    }

    // 3. check stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }, 
        { session }
      );
    }

    // 4. status updation
    order.status = 'REFUNDED';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return order;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};