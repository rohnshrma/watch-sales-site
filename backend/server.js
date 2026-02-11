import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";

config();
connectDB();

const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started on port : ", PORT));
