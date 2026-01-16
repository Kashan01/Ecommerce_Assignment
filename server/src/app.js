const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//Error Handlers
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');


//getting routes
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes'); 

const app = express();
//middlewares
app.use(express.json());
app.use(cors())

//App routes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);


// For all paths that doesn't matches required path
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Global Error Handler
app.use(errorHandler);

module.exports = app;