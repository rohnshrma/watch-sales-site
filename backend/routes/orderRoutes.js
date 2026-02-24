import { Router } from "express";

const router = Router();

// user routes
router.route("/").post(CREATE_ORDER).get(GET_USER_ORDERS);
router.route("/:orderId").get(GET_ORDER_BY_ID);
router.route("/:orderId/cancel").put(CANCEL_ORDER);

// admin
router.route("/:orderId/status").put("UPDATE_ORDER_STATUS");

export default router;
