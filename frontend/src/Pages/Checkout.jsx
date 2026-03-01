import { useContext, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderContext from "../context/OrderContext";
import CartContext from "../context/CartContext";

const initialState = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  paymentMethod: "upi",
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

const Checkout = () => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { createOrder } = useContext(OrderContext);
  const { cartItems } = useContext(CartContext);
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

    setLoading(true);
    setError("");
    try {
      const order = await createOrder({
        shippingAddress: {
          street: state.street,
          city: state.city,
          state: state.state,
          zipCode: state.zipCode,
          country: state.country,
        },
        paymentMethod: state.paymentMethod,
      });
      navigate("/orders", {
        state: { createdOrderId: order._id },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Checkout</h2>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <input
            type="text"
            className="form-control"
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
            className="form-control"
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
            className="form-control"
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
            className="form-control"
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
            className="form-control"
            name="country"
            placeholder="Country"
            value={state.country}
            onChange={changeHandler}
            required
          />
        </div>
        <div className="form-group">
          <select
            className="form-control"
            name="paymentMethod"
            value={state.paymentMethod}
            onChange={changeHandler}
          >
            <option value="upi">UPI</option>
            <option value="credit-card">Credit Card</option>
            <option value="debit-card">Debit Card</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>
        <button className="btn btn-success" disabled={loading}>
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
