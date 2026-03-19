import express from "express";
import {
  REGISTER,
  LOGIN,
  GET_USER_PROFILE,
  DELETE_USER,
  UPDATE_USER_PROFILE,
  GET_ADMIN_DASHBOARD_STATS,
} from "../controllers/userController.js";

import { isAdmin, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", REGISTER);
router.post("/login", LOGIN);

router.get("/profile", protect, GET_USER_PROFILE);
router.put("/profile", protect, UPDATE_USER_PROFILE);
router.get("/admin/dashboard", protect, isAdmin, GET_ADMIN_DASHBOARD_STATS);

router.delete("/:id", protect, DELETE_USER);

export default router;
