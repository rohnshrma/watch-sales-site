// Product model provides DB operations for products collection.
import Product from "../models/product.js";

// GET /api/products
export const GET_PRODUCTS = async (req, res) => {
  try {
    // Fetch all products without filters.
    const products = await Product.find({});

    // Return products payload.
    res.status(200).json({
      data: products,
      message: "Products fetched",
      status: "success",
    });
  } catch (error) {
    // Return generic fetch error.
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};

// POST /api/products
export const ADD_PRODUCT = async (req, res) => {
  try {
    // Extract expected fields from request body.
    const { name, price, description, imageUrl } = req.body;

    // Basic required-field validation.
    if (!name || !price || !description || !imageUrl) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "All fields are required",
      });
    }

    // Create product document.
    const product = await Product.create({
      name,
      price,
      description,
      imageUrl,
    });

    // Return created product.
    res.status(201).json({
      data: product,
      message: "Product added",
      status: "success",
    });
  } catch (error) {
    // Return create error (duplicate key, validation, etc.).
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};

// GET /api/products/:id
export const GET_SINGLE_PRODUCT = async (req, res) => {
  try {
    // Read product id route parameter.
    const { id } = req.params;

    // Find product by id.
    const product = await Product.findOne({ _id: id });

    // Return not-found response if missing.
    if (!product) {
      return res.status(404).json({
        data: null,
        message: "Product not found",
        status: "fail",
      });
    }

    // Return found product.
    res.status(200).json({
      data: product,
      message: "Product fetched",
      status: "success",
    });
  } catch (error) {
    // Return malformed-id or query error.
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};

// DELETE /api/products/:id
export const DELETE_PRODUCT = async (req, res) => {
  try {
    // Read target product id.
    const { id } = req.params;

    // Confirm product exists first.
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({
        data: null,
        message: "Product not found",
        status: "fail",
      });
    }

    // Delete product by id.
    await Product.findByIdAndDelete(id);

    // Return success response with no payload.
    res.status(200).json({
      data: null,
      message: "Product deleted",
      status: "success",
    });
  } catch (error) {
    // Return delete operation error.
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};

// PUT /api/products/:id
export const EDIT_PRODUCT = async (req, res) => {
  try {
    // Read target product id.
    const { id } = req.params;
    // Read editable fields from request body.
    const { name, price, description, imageUrl } = req.body;

    // Fetch existing product first.
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({
        data: null,
        message: "Product not found",
        status: "fail",
      });
    }

    // Apply partial updates while preserving old values for missing fields.
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.imageUrl = imageUrl ?? product.imageUrl;

    // Save updated document.
    const updatedProduct = await product.save();

    // Return updated product.
    res.status(200).json({
      data: updatedProduct,
      message: "Product updated",
      status: "success",
    });
  } catch (error) {
    // Return update operation error.
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};
