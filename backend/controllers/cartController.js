import Cart from "../models/cart.js";
import Product from "../models/product.js";

export const ADD_TO_CART = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        data: null,
        status: "fail",
        message: "Product Not Found",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        cartItems: [],
      });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += quantity;
    } else {
      cart.cartItems.push({
        product: productId,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity,
      });
    }

    cart.total = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      status: "success",
      data: cart,
      message: "Product Added To Cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "fail",
    });
  }
};

export const GET_USER_CART = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart Empty",
      });
    }

    res.status(200).json({
      status: "success",
      data: cart,
      message: "Cart Found",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "fail",
    });
  }
};

export const CLEAR_CART = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    cart.cartItems = [];
    cart.total = 0;
    await cart.save();

    res.status(200).json({
      status: "success",
      data: { cartItems: [], total: 0 },
      message: "Cart Cleared",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "fail",
    });
  }
};

export const REMOVE_CART_ITEM = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart Empty",
      });
    }

    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== productId
    );

    cart.total = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      status: "success",
      data: cart,
      message: "Product Removed From Cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "fail",
    });
  }
};

export const UPDATE_CART_ITEM = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart Empty",
      });
    }

    const item = cart.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        status: "fail",
        data: cart,
        message: "Item Not Found",
      });
    }

    item.quantity = quantity;

    cart.total = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json({
      status: "success",
      data: cart,
      message: "Cart Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "fail",
    });
  }
};
