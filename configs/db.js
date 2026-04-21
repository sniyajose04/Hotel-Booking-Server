import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database connected ✅");
  } catch (error) {
    console.log("DB Error:", error.message);
  }
};

export default connectDB;