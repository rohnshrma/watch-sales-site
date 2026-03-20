import Razorpay from "razorpay";

let razorpayClient = null;

export const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured");
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayClient;
};

export const getRazorpayCurrency = () => {
  return (process.env.RAZORPAY_CURRENCY || "INR").toUpperCase();
};

export const getRazorpayKeyId = () => {
  if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID must be configured");
  }

  return process.env.RAZORPAY_KEY_ID;
};
