const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError'); 
const mongoose = require('mongoose')
/**
 * @param {string} userId 
 * @param {Array} cartItems 
 */
exports.createOrder = async (userId, cartItems) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
    const productId = item.productId;
  const quantity = Number(item.quantity); 


      const product = await Product.findOneAndUpdate(
        { 
          _id: productId, 
          stock: { $gte: quantity } 
        },
        { $inc: { stock: -quantity } }, 
        { new: true, session } 
      );

      if (!product) {
        throw new AppError(`Product ${productId} is out of stock or insufficient quantity`, 400);
      }

      // adding order summery
      orderItems.push({
        product: product._id,
        quantity: quantity,
        priceAtPurchase: product.price 
      });
      
      totalAmount += product.price * quantity;
    }

    // 4. order creation
    const order = await Order.create([{
      user: userId,
      items: orderItems,
      totalAmount,
      status: 'PENDING' 
    }], { session });

    // 5. complete the transaction
    await session.commitTransaction();
    session.endSession();

    return order[0];

  } catch (error) {
    // 6. Rollback 
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};