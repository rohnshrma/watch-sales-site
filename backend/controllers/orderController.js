import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";

export const CREATE_ORDER = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        status: "fail",
        message: "Shipping address and payment method are required",
        data: null,
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Cart is empty",
        data: null,
      });
    }

    const order = await Order.create({
      user: userId,
      orderItems: cart.cartItems,
      shippingAddress,
      total: cart.total,
      paymentMethod,
      status: "pending",
      paymentStatus: "pending",
    });

    cart.cartItems = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

export const GET_USER_ORDERS = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};
