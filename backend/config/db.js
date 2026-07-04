/**
 * @file config/db.js
 * @description MongoDB connection configuration using Mongoose.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas or local instance.
 * Exits the process on connection failure.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are defaults in Mongoose 6+, kept for clarity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB error: ${err.message}`);
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
