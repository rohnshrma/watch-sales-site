import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";

const Cart = () => {
  const { cartItems, total, updateCartItem, removeCartItem, clearCart, loading } =
    useContext(CartContext);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getProductId = (item) =>
    typeof item.product === "string" ? item.product : item.product?._id;

  const updateQuantity = async (productId, quantity) => {
    setError("");
    try {
      await updateCartItem(productId, Number(quantity));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item");
    }
  };

  const removeItem = async (productId) => {
    setError("");
    try {
      await removeCartItem(productId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item");
    }
  };

  const clearAll = async () => {
    setError("");
    try {
      await clearCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear cart");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <p className="page-eyebrow">Cart</p>
          <h2>Your selected pieces</h2>
        </div>
        <button className="btn app-btn app-btn--ghost-danger" onClick={clearAll}>
          Clear Cart
        </button>
      </div>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : null}
      {!loading && cartItems.length === 0 ? (
        <div className="alert alert-info">Your cart is empty.</div>
      ) : null}
      {cartItems.map((item) => (
        <div key={getProductId(item)} className="cart-item-card mb-3">
          <div className="cart-item-card__body d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="cart-item-card__image mr-3"
              />
              <div>
                <h5 className="mb-1">{item.name}</h5>
                <p className="mb-0">₹{Number(item.price).toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="d-flex align-items-center mt-3 mt-md-0">
              <input
                type="number"
                min="0"
                className="form-control app-input cart-item-card__qty mr-2"
                value={item.quantity}
                onChange={(e) => updateQuantity(getProductId(item), e.target.value)}
              />
              <button
                className="btn app-btn app-btn--ghost-danger"
                onClick={() => removeItem(getProductId(item))}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="cart-summary-card mt-4">
        <div className="cart-summary-card__body d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Total: ₹{Number(total).toLocaleString("en-IN")}</h4>
          <button
            className="btn app-btn app-btn--primary"
            onClick={() => navigate("/checkout")}
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
