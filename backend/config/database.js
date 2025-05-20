import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Use environment variable or fallback to a local MongoDB URI
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/fullstack_auth_db";
const NODE_ENV = process.env.NODE_ENV || "development";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
