const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Ensure reliable public DNS resolution for MongoDB Atlas SRV records on Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore error if custom DNS servers cannot be set in restricted environments
}

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nessa_enterprise';
  
  // Safely mask credentials for logging
  const maskedURI = mongoURI.replace(/\/\/(.*):(.*)@/, '//***:***@');

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`✅ MongoDB Atlas / Server Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
    console.log(`   Target: ${maskedURI}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`   Target attempted: ${maskedURI}`);
    throw error;
  }
};

module.exports = connectDB;
