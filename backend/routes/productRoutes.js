import { Router } from "express";
import {
  GET_PRODUCTS,
  ADD_PRODUCT,
  GET_SINGLE_PRODUCT,
  DELETE_PRODUCT,
  EDIT_PRODUCT,
} from "../controllers/productController.js";

const router = Router();

router.route("/").get(GET_PRODUCTS).post(ADD_PRODUCT);

router
  .route("/:id")
  .get(GET_SINGLE_PRODUCT)
  .delete(DELETE_PRODUCT)
  .put(EDIT_PRODUCT);

export default router;
