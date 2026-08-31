import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
    if (retries > 0) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), RETRY_DELAY_MS);
    } else {
      console.log("MongoDB connection failed after all retries. Exiting.");
      process.exit(1);
    }
  }
};