// Express Router groups product-related endpoints.
import { Router } from "express";
// Product controller handlers mapped to REST operations.
import {
  GET_PRODUCTS,
  ADD_PRODUCT,
  GET_SINGLE_PRODUCT,
  DELETE_PRODUCT,
  EDIT_PRODUCT,
} from "../controllers/productController.js";

// Create router instance for product module.
const router = Router();

// /api/products -> list all products, or create a product.
router.route("/").get(GET_PRODUCTS).post(ADD_PRODUCT);

// /api/products/:id -> read, delete, or update one product.
router
  .route("/:id")
  .get(GET_SINGLE_PRODUCT)
  .delete(DELETE_PRODUCT)
  .put(EDIT_PRODUCT);

// Export router so server.js can mount it.
export default router;
