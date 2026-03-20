import { useContext, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderContext from "../context/OrderContext";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";

const initialState = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  paymentMethod: "razorpay",
};

const checkoutReducer = (state, action) => {
  if (Object.hasOwn(initialState, action.type)) {
    return {
      ...state,
      [action.type]: action.payload,
    };
  }

  return state;
};

const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const loadRazorpayCheckout = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const normalizeCountryCode = (country) => {
  const value = country.trim();
  if (!value) {
    return "";
  }

  const upperValue = value.toUpperCase();
  if (upperValue === "INDIA") {
    return "IN";
  }

  if (upperValue === "UNITED STATES" || upperValue === "UNITED STATES OF AMERICA") {
    return "US";
  }

  return upperValue;
};

const Checkout = () => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { createRazorpayOrder, createOrder } = useContext(OrderContext);
  const { cartItems, total, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const changeHandler = (e) => {
    dispatch({ type: e.target.name, payload: e.target.value });
  };

  const openRazorpayCheckout = (paymentOrder, shippingAddress) => {
    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amountInPaise,
        currency: paymentOrder.currency,
        name: "Watch Store",
        description: "Secure watch order payment",
        order_id: paymentOrder.orderId,
        handler: async (response) => {
          try {
            const order = await createOrder({
              shippingAddress,
              paymentMethod: "razorpay",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve(order);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment was cancelled")),
        },
        prefill: {
          name: user?.name || "Watch Store User",
          email: user?.email || "",
        },
        notes: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
        theme: {
          color: "#1f6a5a",
        },
      });

      razorpay.open();
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError("Cart is empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayCheckout();
      if (!scriptLoaded) {
        throw new Error("Razorpay checkout failed to load");
      }

      const normalizedCountry = normalizeCountryCode(state.country);
      const shippingAddress = {
        street: state.street,
        city: state.city,
        state: state.state,
        zipCode: state.zipCode,
        country: normalizedCountry || state.country,
      };

      const paymentOrder = await createRazorpayOrder({ shippingAddress });
      const order = await openRazorpayCheckout(paymentOrder, shippingAddress);

      await fetchCart();
      navigate("/orders", {
        state: { createdOrderId: order._id },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to complete payment");
    } finally {
      setLoading(false);
    }
  };

  if (!razorpayKeyId) {
    return (
      <div className="page-shell page-shell--narrow">
        <div className="form-shell">
          <h2 className="mb-4">Checkout</h2>
          <div className="alert alert-warning mb-0">
            Set <code>VITE_RAZORPAY_KEY_ID</code> in the frontend environment to enable
            Razorpay checkout.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell page-shell--narrow">
      <div className="form-shell">
        <div className="page-header page-header--compact">
          <p className="page-eyebrow">Checkout</p>
          <h2>Complete your order</h2>
          <p className="page-subtext">
            Enter shipping details and finish your payment with Razorpay.
          </p>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="alert alert-info">
          Razorpay will open a secure checkout window after you review your shipping
          details.
        </div>
        <form onSubmit={submitHandler} className="form-stack">
          <div className="form-group">
            <input
              type="text"
              className="form-control app-input"
              name="street"
              placeholder="Street"
              value={state.street}
              onChange={changeHandler}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control app-input"
              name="city"
              placeholder="City"
              value={state.city}
              onChange={changeHandler}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control app-input"
              name="state"
              placeholder="State"
              value={state.state}
              onChange={changeHandler}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control app-input"
              name="zipCode"
              placeholder="Zip Code"
              value={state.zipCode}
              onChange={changeHandler}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control app-input"
              name="country"
              placeholder="Country code (e.g. IN)"
              value={state.country}
              onChange={changeHandler}
              required
            />
          </div>
          <div className="form-group">
            <select
              className="form-control app-input"
              name="paymentMethod"
              value={state.paymentMethod}
              onChange={changeHandler}
              disabled
            >
              <option value="razorpay">Razorpay</option>
            </select>
          </div>
          <div className="checkout-card-input">
            Secure payment is handled in the Razorpay popup after form submission.
          </div>
          <div className="checkout-total">
            <strong>Total:</strong> ₹{Number(total).toLocaleString("en-IN")}
          </div>
          <button className="btn app-btn app-btn--primary app-btn--block" disabled={loading}>
            {loading ? "Opening Razorpay..." : "Pay with Razorpay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
