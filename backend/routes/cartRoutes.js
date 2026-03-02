// Express Router groups cart-related endpoints.
import { Router } from "express";
// Cart controller handlers for CRUD-like cart operations.
import {
  ADD_TO_CART,
  GET_USER_CART,
  UPDATE_CART_ITEM,
  REMOVE_CART_ITEM,
  CLEAR_CART,
} from "../controllers/cartController.js";

// Create router instance for cart module.
const router = Router();

// /api/cart -> add item, read cart, or update item quantity.
router.route("/").post(ADD_TO_CART).get(GET_USER_CART).put(UPDATE_CART_ITEM);
// /api/cart/clear -> remove all items from cart.
router.route("/clear").delete(CLEAR_CART);
// /api/cart/:productId -> remove a specific item from cart.
router.route("/:productId").delete(REMOVE_CART_ITEM);

// Export router so server.js can mount it.
export default router;
