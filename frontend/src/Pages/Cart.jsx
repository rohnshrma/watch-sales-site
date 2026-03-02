// React hooks for context data, local error state, and navigation action.
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../context/CartContext";

// Cart page to view and manage items currently in cart.
const Cart = () => {
  // Pull cart data and cart actions from context.
  const { cartItems, total, updateCartItem, removeCartItem, clearCart, loading } =
    useContext(CartContext);
  // Error message state for failed cart operations.
  const [error, setError] = useState("");
  // Navigation helper for CTA links.
  const navigate = useNavigate();

  // Handles both populated and populated-reference product shapes.
  const getProductId = (item) =>
    typeof item.product === "string" ? item.product : item.product?._id;

  // Update item quantity with basic numeric guard.
  const updateQuantity = async (productId, quantity) => {
    const safeQuantity = Number(quantity);
    if (!Number.isFinite(safeQuantity) || safeQuantity < 1) return;
    setError("");
    try {
      await updateCartItem(productId, safeQuantity);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item");
    }
  };

  // Remove one item from cart.
  const removeItem = async (productId) => {
    setError("");
    try {
      await removeCartItem(productId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item");
    }
  };

  // Clear all cart items.
  const clearAll = async () => {
    setError("");
    try {
      await clearCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear cart");
    }
  };

  // Increment current item quantity by one.
  const incrementQuantity = (item) => {
    updateQuantity(getProductId(item), Number(item.quantity) + 1);
  };

  // Decrement current item quantity but never below one.
  const decrementQuantity = (item) => {
    const nextQuantity = Number(item.quantity) - 1;
    if (nextQuantity < 1) return;
    updateQuantity(getProductId(item), nextQuantity);
  };

  // Sum all quantities to display total units in summary panel.
  const itemCount = cartItems.reduce((count, item) => count + Number(item.quantity), 0);

  return (
    <div className="lux-shell lux-page">
      <section className="lux-page-head">
        <h2 className="lux-title">Your Cart</h2>
        <button className="lux-btn lux-btn-danger" onClick={clearAll}>
          Clear Cart
        </button>
      </section>

      {/* Conditional alert states. */}
      {error ? <div className="lux-alert lux-alert-danger">{error}</div> : null}
      {loading ? (
        <div className="lux-loader-wrap">
          <div className="lux-spinner" role="status"></div>
        </div>
      ) : null}
      {!loading && cartItems.length === 0 ? (
        <div className="lux-alert lux-alert-info">Your cart is empty.</div>
      ) : null}

      <div className="cart-layout">
        <section className="cart-items-panel">
          {/* Table-like headers for cart columns. */}
          <div className="cart-items-head">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          {/* Render each cart row card. */}
          {cartItems.map((item) => {
            const lineTotal = Number(item.price) * Number(item.quantity);
            return (
              <article key={getProductId(item)} className="cart-item-card">
                <div className="cart-item-main">
                  <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-meta">
                    <h5>{item.name}</h5>
                    <p className="lux-muted">₹{Number(item.price).toLocaleString("en-IN")} each</p>
                    <span className="cart-item-badge">Ready to ship</span>
                  </div>
                </div>

                <div className="cart-item-controls">
                  <p className="cart-item-label">Quantity</p>
                  <div className="qty-control">
                    <button
                      type="button"
                      className="lux-btn lux-btn-ghost qty-btn"
                      onClick={() => decrementQuantity(item)}
                      disabled={Number(item.quantity) <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="lux-input qty-input"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(getProductId(item), Math.max(1, Number(e.target.value)))
                      }
                    />
                    <button
                      type="button"
                      className="lux-btn lux-btn-ghost qty-btn"
                      onClick={() => incrementQuantity(item)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-price">
                  <p className="cart-item-label">Line Total</p>
                  <p className="cart-line-total">₹{lineTotal.toLocaleString("en-IN")}</p>
                  <button
                    className="lux-btn lux-btn-ghost"
                    onClick={() => removeItem(getProductId(item))}
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* Summary sidebar. */}
        <aside className="lux-summary-card cart-summary">
          <h4>Order Summary</h4>
          <div className="summary-row">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{Number(total).toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row summary-row-total">
            <span>Total</span>
            <span>₹{Number(total).toLocaleString("en-IN")}</span>
          </div>
          <button
            className="lux-btn lux-btn-primary lux-btn-block"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </aside>
      </div>
    </div>
  );
};

// Export page component for route usage.
export default Cart;
