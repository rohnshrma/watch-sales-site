// Mongoose handles MongoDB connection and schema modeling.
import mongoose from "mongoose";

// Connect helper keeps startup logic centralized.
const connectDB = async () => {
  try {
    // Open MongoDB connection using MONGO_URI from environment variables.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Log connected host for quick verification in terminal.
    console.log("DB CONNECTED : ", conn.connection.host);
  } catch (err) {
    // Print connection error details.
    console.log(err);
    // Exit process so app does not run without database access.
    process.exit(1);
  }
};

// Export DB connector for server bootstrap usage.
export default connectDB;
