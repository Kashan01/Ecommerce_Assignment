# E-Commerce API (MERN)

A concurrency-safe E-commerce backend designed to handle high-traffic inventory management without overselling.

## Tech Stack
- **Node.js & Express**: Backend API
- **MongoDB & Mongoose**: Database (utilizing Atomic Operators for consistency)
- **React (Vite)**: Frontend Demo Interface

## Features
1.  **Concurrency Safety**: Uses `findOneAndUpdate` with `$gte` constraints to prevent race conditions when multiple users buy the last item simultaneously.
2.  **Transactional Integrity**: Stock is reserved immediately upon order creation.
3.  **Automated Refunds**: Cancelling an order automatically restores stock to the inventory using atomic increments.
4.  **Role-Based Features**: Admin panel to manage inventory; User panel to track order lifecycle.

## Installation 

1. **Backend**

   cd server
   npm install
   # Create src/config/config.env with PORT and DATABASE_URI
   node server.js

frontend

Env varialbes /

NODE_ENV=development
PORT=3000
DATABASE_URI=url
DATABASE_PASSWORD=your_actual_password
JWT_SECRET=this-is-my-ultra-secure-long-secret-key-for-jwt
JWT_EXPIRES_IN=90d

Can you continue testing with test@gmail.com user
