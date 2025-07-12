import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL environment variable is not set.");
  console.error("Please set the MONGODB_URL in your environment variables.");
  console.error("The application will not work without a MongoDB connection.");
  throw new Error(
    "MONGODB_URL must be set. Please provide your MongoDB Atlas connection string.",
  );
}

export async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export { mongoose };