import express from "express";
import {
  REGISTER,
  LOGIN,
  GET_USER_PROFILE,
  DELETE_USER,
  UPDATE_CART_ITEM,
} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", REGISTER);
router.post("/login", LOGIN);

router.get("/profile", protect, GET_USER_PROFILE);
router.put("/profile", protect, UPDATE_CART_ITEM);

router.delete("/:id", protect, DELETE_USER);

export default router;
