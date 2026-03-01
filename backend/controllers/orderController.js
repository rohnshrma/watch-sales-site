import Order from "../models/order.js";
import Cart from "../models/cart.js";

const allowedStatuses = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const allowedPaymentStatuses = ["pending", "completed", "failed"];

const isOwnerOrAdmin = (order, user) => {
  return order.user.toString() === user.id || user.role === "admin";
};

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

    const { street, city, state, zipCode, country } = shippingAddress;
    if (!street || !city || !state || !zipCode || !country) {
      return res.status(400).json({
        status: "fail",
        message: "Complete shipping address is required",
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

    return res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
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

    return res.status(200).json({
      status: "success",
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

export const GET_ORDER_BY_ID = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
        data: null,
      });
    }

    if (!isOwnerOrAdmin(order, req.user)) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to view this order",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

export const CANCEL_ORDER = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
        data: null,
      });
    }

    if (!isOwnerOrAdmin(order, req.user)) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to cancel this order",
        data: null,
      });
    }

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        status: "fail",
        message: `Order cannot be cancelled once it is ${order.status}`,
        data: null,
      });
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

export const UPDATE_ORDER_STATUS = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
        data: null,
      });
    }

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid order status",
          data: null,
        });
      }
      order.status = status;
    }

    if (paymentStatus) {
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid payment status",
          data: null,
        });
      }
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      status: "success",
      message: "Order status updated",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};
