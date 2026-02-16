import Product from "../models/product.js";

export const GET_PRODUCTS = async (req, res) => {
  try {
    const products = await Product.find({});
    // if (!products || products.length === 0) {
    //   return res.status(404).json({
    //     data: [],
    //     message: "Products Not Found",
    //     status: "fail",
    //   });
    // }

    res.status(201).json({
      data: products,
      message: "Products Fetched",
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};
export const ADD_PRODUCT = async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;
    if (!name || !price || !description || !imageUrl) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "All Fields Are Required",
      });
    }

    const product = await Product.create({
      name,
      price,
      description,
      imageUrl,
    });

    res.status(201).json({
      data: product,
      message: "Product Added",
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};
export const GET_SINGLE_PRODUCT = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({
        data: null,
        message: "Product Not Found",
        status: "fail",
      });
    }

    res.status(201).json({
      data: product,
      message: "Product Fetched",
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};
export const DELETE_PRODUCT = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({
        data: null,
        message: "Product Not Found",
        status: "fail",
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      data: null,
      message: "Product Deleted",
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};
export const EDIT_PRODUCT = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, imageUrl } = req.body;

    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({
        data: null,
        message: "Product Not Found",
        status: "fail",
      });
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.imageUrl = imageUrl ?? product.imageUrl;

    const updatedProduct = await product.save();

    res.status(200).json({
      data: updatedProduct,
      message: "Product Updated",
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};
