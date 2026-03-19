import { useContext, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import OrderContext from "../context/OrderContext";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";

const initialState = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  paymentMethod: "stripe",
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

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#212529",
      "::placeholder": {
        color: "#6c757d",
      },
    },
    invalid: {
      color: "#dc3545",
    },
  },
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

const CheckoutForm = () => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { createPaymentIntent, createOrder } = useContext(OrderContext);
  const { cartItems, total, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const changeHandler = (e) => {
    dispatch({ type: e.target.name, payload: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError("Cart is empty");
      return;
    }

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const normalizedCountry = normalizeCountryCode(state.country);

      const shippingAddress = {
        street: state.street,
        city: state.city,
        state: state.state,
        zipCode: state.zipCode,
        country: normalizedCountry || state.country,
      };

      const paymentIntent = await createPaymentIntent({
        shippingAddress,
      });

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card form is not ready");
      }

      const confirmation = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.name || "Watch Store User",
              email: user?.email || "",
              address: {
                line1: state.street,
                city: state.city,
                state: state.state,
                postal_code: state.zipCode,
                country: normalizedCountry,
              },
            },
          },
          shipping: {
            name: user?.name || "Watch Store User",
            address: {
              line1: state.street,
              city: state.city,
              state: state.state,
              postal_code: state.zipCode,
              country: normalizedCountry,
            },
          },
        }
      );

      if (confirmation.error) {
        throw new Error(confirmation.error.message || "Stripe payment failed");
      }

      if (confirmation.paymentIntent?.status !== "succeeded") {
        throw new Error("Payment was not completed successfully");
      }

      const order = await createOrder({
        shippingAddress,
        paymentMethod: "stripe",
        paymentIntentId: confirmation.paymentIntent.id,
      });
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

  return (
    <div className="page-shell page-shell--narrow">
      <div className="form-shell">
        <div className="page-header page-header--compact">
          <p className="page-eyebrow">Checkout</p>
          <h2>Complete your order</h2>
          <p className="page-subtext">Enter shipping details and confirm your Stripe payment.</p>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <div className="alert alert-info">
          Use Stripe test card <strong>4242 4242 4242 4242</strong>, any future expiry,
          any 3-digit CVC, and any postal code.
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
              <option value="stripe">Stripe Test Mode</option>
            </select>
          </div>
          <div className="form-group">
            <label className="font-weight-bold mb-2">Card Details</label>
            <div className="checkout-card-input">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
          <div className="checkout-total">
            <strong>Total:</strong> ₹{Number(total).toLocaleString("en-IN")}
          </div>
          <button className="btn app-btn app-btn--primary app-btn--block" disabled={loading}>
            {loading ? "Processing payment..." : "Pay and Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Checkout = () => {
  if (!stripePromise) {
    return (
      <div className="page-shell page-shell--narrow">
        <div className="form-shell">
          <h2 className="mb-4">Checkout</h2>
          <div className="alert alert-warning mb-0">
            Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in the frontend environment to
            enable Stripe test payments.
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
