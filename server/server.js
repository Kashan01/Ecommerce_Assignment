const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Handling uncaught exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err.name, err.message);
  process.exit(1);
});

//for env variables
dotenv.config({ path: './src/config/config.env' }); 

const app = require('./src/app');

// database connection
const DB = process.env.DATABASE_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);


mongoose 
  .connect(DB, {
 })
  .then(() => console.log('DB connection successful!'))
  .catch(err => {
    console.log('DB Connection Error:', err);
  });

// Server listens on port 3000
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


//In case of rejections serves close itself 
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});