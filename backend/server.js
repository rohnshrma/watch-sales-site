// Express is the HTTP server framework used for API endpoints.
import express from "express";
// dotenv loads environment variables from .env into process.env.
import { config } from "dotenv";
// cors enables cross-origin requests from frontend apps.
import cors from "cors";
// Mongo connection helper.
import connectDB from "./config/db.js";
// Product route module.
import productRoutes from "./routes/productRoutes.js";
// Cart route module.
import cartRoutes from "./routes/cartRoutes.js";
// morgan logs HTTP requests in development-friendly format.
import morgan from "morgan";

// Load env file values before using process.env.
config();
// Establish MongoDB connection at server startup.
connectDB();

// Create the Express application instance.
const app = express();

// Enable CORS for browser frontend requests.
app.use(cors());
// Parse incoming JSON bodies into req.body.
app.use(express.json());
// Log each incoming request line in dev format.
app.use(morgan("dev"));

// Mount product endpoints under /api/products.
app.use("/api/products", productRoutes);
// Mount cart endpoints under /api/cart.
app.use("/api/cart", cartRoutes);

// Resolve runtime port from env or fallback to 3000.
const PORT = process.env.PORT || 3000;
// Start HTTP server listener.
app.listen(PORT, () => console.log("Server started on port : ", PORT));
