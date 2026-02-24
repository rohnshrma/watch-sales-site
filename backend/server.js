import express from "express";
import { config } from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import morgan from "morgan";
config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON request bodies
app.use(morgan("dev"));
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started on port : ", PORT));
