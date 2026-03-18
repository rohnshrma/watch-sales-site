import Order from "../models/order.js";
import Cart from "../models/cart.js";
import { getStripeClient, getStripeCurrency } from "../utils/stripe.js";

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

const buildStripeMetadata = (userId, cart) => {
  return {
    userId: userId.toString(),
    cartTotal: String(Number(cart.total)),
    itemCount: String(cart.cartItems.length),
  };
};

export const CREATE_STRIPE_PAYMENT_INTENT = async (req, res) => {
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

    const stripe = getStripeClient();
    const currency = getStripeCurrency();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: getAmountInSmallestUnit(cart.total),
      currency,
      payment_method_types: ["card"],
      metadata: buildStripeMetadata(userId, cart),
      description: `Watch store order for user ${userId}`,
    });

    return res.status(200).json({
      status: "success",
      message: "Stripe payment intent created successfully",
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: cart.total,
        currency,
      },
    });
  } catch (error) {
    const statusCode = error.type?.startsWith("Stripe") ? 400 : 500;

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
    const { shippingAddress, paymentMethod, paymentIntentId } = req.body;

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

    if (paymentMethod === "stripe") {
      if (!paymentIntentId) {
        return res.status(400).json({
          status: "fail",
          message: "paymentIntentId is required for Stripe payments",
          data: null,
        });
      }

      const existingOrder = await Order.findOne({ paymentIntentId });
      if (existingOrder) {
        return res.status(409).json({
          status: "fail",
          message: "An order has already been created for this payment",
          data: existingOrder,
        });
      }

      const stripe = getStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (!paymentIntent) {
        return res.status(404).json({
          status: "fail",
          message: "Stripe payment intent not found",
          data: null,
        });
      }

      if (paymentIntent.metadata?.userId !== userId.toString()) {
        return res.status(403).json({
          status: "fail",
          message: "Payment intent does not belong to the current user",
          data: null,
        });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          status: "fail",
          message: "Stripe payment has not been completed",
          data: null,
        });
      }

      const expectedAmount = getAmountInSmallestUnit(cart.total);
      if (paymentIntent.amount !== expectedAmount) {
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
        paymentIntentId: paymentIntent.id,
        paidAt: new Date(),
        paymentResult: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          currency: paymentIntent.currency,
          amount: paymentIntent.amount,
          paymentMethodTypes: paymentIntent.payment_method_types,
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
