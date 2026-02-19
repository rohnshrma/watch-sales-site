import { Router } from "express";
import {
  ADD_TO_CART,
  GET_USER_CART,
  UPDATE_CART_ITEM,
  REMOVE_CART_ITEM,
  CLEAR_CART,
} from "../controllers/cartController.js";

const router = Router();

router.route("/").post(ADD_TO_CART).get(GET_USER_CART).put(UPDATE_CART_ITEM);
router.route("/clear", CLEAR_CART);
router.route("/:productId", REMOVE_CART_ITEM);

export default router;
