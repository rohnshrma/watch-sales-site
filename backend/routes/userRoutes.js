// Express router groups user/auth endpoints.
import express from "express";
// User controller actions.
import {
  REGISTER,
  LOGIN,
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
} from "../controllers/userController.js";
// Auth middleware protects profile routes.
import { protect } from "../middlewares/authMiddleware.js";

// Router instance for /api/users.
const router = express.Router();

// Public auth endpoints.
router.post("/register", REGISTER);
router.post("/login", LOGIN);

// Protected profile endpoints.
router.get("/profile", protect, GET_USER_PROFILE);
router.put("/profile", protect, UPDATE_USER_PROFILE);

// Export router for server mounting.
export default router;
