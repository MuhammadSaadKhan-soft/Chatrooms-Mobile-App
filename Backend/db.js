require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;


const connectToMongo = async () => {
  try {
      await mongoose.connect(uri); // Removed deprecated options
      console.log("Connected to MongoDB successfully");

  } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToMongo;
