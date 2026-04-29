import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    console.log("Attempting to connect to database...");

    const connection = await mongoose.connect(
      "mongodb://127.0.0.1:27017/storefleet",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`Database connected at host: ${connection.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};