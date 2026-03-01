import { Router } from "express";
import {
  CREATE_ORDER,
  GET_USER_ORDERS,
  GET_ORDER_BY_ID,
  CANCEL_ORDER,
  UPDATE_ORDER_STATUS,
} from "../controllers/orderController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// user routes
router.route("/").post(CREATE_ORDER).get(GET_USER_ORDERS);
router.route("/:orderId").get(GET_ORDER_BY_ID);
router.route("/:orderId/cancel").put(CANCEL_ORDER);

// admin routes
router.route("/:orderId/status").put(isAdmin, UPDATE_ORDER_STATUS);

export default router;
