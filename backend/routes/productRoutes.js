import { Router } from "express";

const router = Router();

router.route("/").get(GET_PRODUCTS).post(ADD_PRODUCT);

router
  .route("/:id")
  .get(GET_SINGLE_PRODUCT)
  .delete(DELETE_PRODUCT)
  .put(EDIT_PRODUCT);
