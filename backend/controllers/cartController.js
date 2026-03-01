import Cart from "../models/cart.js";
import Product from "../models/product.js";

const getCartTotal = (cartItems) => {
  return cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
};

export const ADD_TO_CART = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "productId is required",
      });
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "quantity must be a positive integer",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        data: null,
        status: "fail",
        message: "Product not found",
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
      cart.cartItems[itemIndex].quantity += parsedQuantity;
    } else {
      cart.cartItems.push({
        product: productId,
        name: product.name,
        imageUrl: product.imageUrl,
        price: Number(product.price),
        quantity: parsedQuantity,
      });
    }

    cart.total = getCartTotal(cart.cartItems);

    await cart.save();

    return res.status(200).json({
      status: "success",
      data: cart,
      message: "Product added to cart",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};

export const GET_USER_CART = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("cartItems.product");

    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart empty",
      });
    }

    return res.status(200).json({
      status: "success",
      data: cart,
      message: "Cart found",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};

export const CLEAR_CART = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart already empty",
      });
    }

    cart.cartItems = [];
    cart.total = 0;
    await cart.save();

    return res.status(200).json({
      status: "success",
      data: { cartItems: [], total: 0 },
      message: "Cart cleared",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
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
        message: "Cart empty",
      });
    }

    const initialLength = cart.cartItems.length;
    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.cartItems.length === initialLength) {
      return res.status(404).json({
        status: "fail",
        data: cart,
        message: "Item not found in cart",
      });
    }

    cart.total = getCartTotal(cart.cartItems);

    await cart.save();

    return res.status(200).json({
      status: "success",
      data: cart,
      message: "Product removed from cart",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};

export const UPDATE_CART_ITEM = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!productId) {
      return res.status(400).json({
        status: "fail",
        data: null,
        message: "productId is required",
      });
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        status: "fail",
        data: null,
        message: "quantity must be a non-negative integer",
      });
    }

    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart empty",
      });
    }

    const item = cart.cartItems.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        status: "fail",
        data: cart,
        message: "Item not found",
      });
    }

    if (parsedQuantity === 0) {
      cart.cartItems = cart.cartItems.filter(
        (cartItem) => cartItem.product.toString() !== productId
      );
    } else {
      item.quantity = parsedQuantity;
    }

    cart.total = getCartTotal(cart.cartItems);

    await cart.save();
    return res.status(200).json({
      status: "success",
      data: cart,
      message: "Cart updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};
