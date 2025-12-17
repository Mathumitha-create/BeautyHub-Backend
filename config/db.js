const mongoose = require("mongoose");

async function connectDB() {
  try {
   
    // await mongoose.connect(
    //   "mongodb+srv://mathupriya2006:mathu2006@cluster0.3a56ff7.mongodb.net/ecommerce"
    // );
    await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce")
    console.log("Connected to MongoDB");


  } catch (err) {
    console.error("MongoDB connection error", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
