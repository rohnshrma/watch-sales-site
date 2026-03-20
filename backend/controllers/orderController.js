import Order from "../models/order.js";
import Cart from "../models/cart.js";
import crypto from "crypto";
import {
  getRazorpayClient,
  getRazorpayCurrency,
  getRazorpayKeyId,
} from "../utils/razorpay.js";

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

const validateShippingAddress = (shippingAddress) => {
  if (!shippingAddress) {
    return "Shipping address is required";
  }

  const { street, city, state, zipCode, country } = shippingAddress;
  if (!street || !city || !state || !zipCode || !country) {
    return "Complete shipping address is required";
  }

  return null;
};

const getCartForCheckout = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.cartItems.length === 0) {
    return null;
  }

  return cart;
};

const getAmountInSmallestUnit = (amount) => {
  return Math.round(Number(amount) * 100);
};

const buildRazorpayNotes = (userId, cart) => {
  return {
    userId: userId.toString(),
    cartTotal: String(Number(cart.total)),
    itemCount: String(cart.cartItems.length),
  };
};

const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
};

export const CREATE_RAZORPAY_ORDER = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    const shippingError = validateShippingAddress(shippingAddress);
    if (shippingError) {
      return res.status(400).json({
        status: "fail",
        message: shippingError,
        data: null,
      });
    }

    const cart = await getCartForCheckout(userId);
    if (!cart) {
      return res.status(400).json({
        status: "fail",
        message: "Cart is empty",
        data: null,
      });
    }

    const razorpay = getRazorpayClient();
    const currency = getRazorpayCurrency();
    const amount = getAmountInSmallestUnit(cart.total);

    const paymentOrder = await razorpay.orders.create({
      amount,
      currency,
      receipt: `order_${userId}_${Date.now()}`,
      notes: buildRazorpayNotes(userId, cart),
    });

    return res.status(200).json({
      status: "success",
      message: "Razorpay order created successfully",
      data: {
        orderId: paymentOrder.id,
        keyId: getRazorpayKeyId(),
        amount: cart.total,
        amountInPaise: amount,
        currency,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

export const CREATE_ORDER = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddress,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        status: "fail",
        message: "Shipping address and payment method are required",
        data: null,
      });
    }

    const shippingError = validateShippingAddress(shippingAddress);
    if (shippingError) {
      return res.status(400).json({
        status: "fail",
        message: shippingError,
        data: null,
      });
    }

    const cart = await getCartForCheckout(userId);
    if (!cart) {
      return res.status(400).json({
        status: "fail",
        message: "Cart is empty",
        data: null,
      });
    }

    let orderPayload = {
      user: userId,
      orderItems: cart.cartItems,
      shippingAddress,
      total: cart.total,
      paymentMethod,
      status: "pending",
      paymentStatus: "pending",
    };

    if (paymentMethod === "razorpay") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
          status: "fail",
          message:
            "razorpayOrderId, razorpayPaymentId, and razorpaySignature are required",
          data: null,
        });
      }

      const existingOrder = await Order.findOne({
        paymentReferenceId: razorpayPaymentId,
      });
      if (existingOrder) {
        return res.status(409).json({
          status: "fail",
          message: "An order has already been created for this payment",
          data: existingOrder,
        });
      }

      const signatureIsValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!signatureIsValid) {
        return res.status(400).json({
          status: "fail",
          message: "Razorpay signature verification failed",
          data: null,
        });
      }

      const razorpay = getRazorpayClient();
      const [payment, paymentOrder] = await Promise.all([
        razorpay.payments.fetch(razorpayPaymentId),
        razorpay.orders.fetch(razorpayOrderId),
      ]);

      if (!payment || !paymentOrder) {
        return res.status(404).json({
          status: "fail",
          message: "Razorpay payment details not found",
          data: null,
        });
      }

      if (paymentOrder.notes?.userId !== userId.toString()) {
        return res.status(403).json({
          status: "fail",
          message: "Payment order does not belong to the current user",
          data: null,
        });
      }

      if (payment.order_id !== razorpayOrderId) {
        return res.status(400).json({
          status: "fail",
          message: "Payment does not match the supplied Razorpay order",
          data: null,
        });
      }

      if (!["authorized", "captured"].includes(payment.status)) {
        return res.status(400).json({
          status: "fail",
          message: "Razorpay payment has not been completed",
          data: null,
        });
      }

      const expectedAmount = getAmountInSmallestUnit(cart.total);
      if (
        payment.amount !== expectedAmount ||
        paymentOrder.amount !== expectedAmount ||
        payment.currency !== getRazorpayCurrency()
      ) {
        return res.status(400).json({
          status: "fail",
          message: "Paid amount does not match the current cart total",
          data: null,
        });
      }

      orderPayload = {
        ...orderPayload,
        status: "confirmed",
        paymentStatus: "completed",
        paymentReferenceId: payment.id,
        paidAt: new Date(),
        paymentResult: {
          id: payment.id,
          orderId: payment.order_id,
          status: payment.status,
          currency: payment.currency,
          amount: payment.amount,
          method: payment.method,
          signatureVerified: true,
        },
      };
    }

    const order = await Order.create(orderPayload);

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

export const GET_ALL_ORDERS = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email role")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      message: "All orders fetched successfully",
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
