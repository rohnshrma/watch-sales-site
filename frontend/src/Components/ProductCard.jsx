// React hooks support context-based actions inside each card.
import React, { useContext } from "react";
// useNavigate enables programmatic route transitions from button clicks.
import { useNavigate } from "react-router-dom";
// ProductContext exposes product delete action for management mode.
import ProductContext from "../context/ProductContext";
// CartContext exposes add-to-cart action for storefront mode.
import CartContext from "../context/CartContext";

// Reusable product card; optionally switches to management action buttons.
const ProductCard = ({ product, showManageActions = false }) => {
  // Router navigation function.
  const navigate = useNavigate();
  // Product delete action from context.
  const { deleteProduct } = useContext(ProductContext);
  // Cart add action from context.
  const { addProductToCart } = useContext(CartContext);

  // Handles adding one unit of product to cart.
  const addToCartHandler = async () => {
    try {
      // Product object is accepted by CartContext helper.
      await addProductToCart(product, 1);
      // Lightweight feedback for successful add.
      alert("Added to cart");
    } catch (error) {
      // Surface user-friendly message if API call fails.
      alert(error.message || "Failed to add item to cart");
    }
  };

  return (
    <article className="product-card-shell">
      <div className="product-card">
        {/* Product image area navigates to the detail page. */}
        <button
          type="button"
          className="product-image-section"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          <img src={product.imageUrl} className="product-image" alt={product.name} />
          {/* Decorative heart icon for visual style only. */}
          <span className="favorite-btn" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </span>
        </button>

        <div className="product-info">
          {/* Product title. */}
          <h3 className="product-name">{product.name}</h3>

          {/* Static label/tag for styling context. */}
          <div className="product-tags">
            <span className="product-tag">Luxury Watch</span>
          </div>

          {/* Short product description preview. */}
          <p className="product-desc">{product.description}</p>

          <div className="product-bottom">
            {/* Price block with locale formatting. */}
            <div className="price-section">
              <span className="price-label">Price</span>
              <span className="price-value">₹{Number(product.price).toLocaleString("en-IN")}</span>
            </div>

            {/* Action block changes by mode: management vs storefront. */}
            <div className="action-section">
              {showManageActions ? (
                <>
                  <button className="lux-btn lux-btn-danger" onClick={() => deleteProduct(product._id)}>
                    Delete
                  </button>
                  <button
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    className="lux-btn lux-btn-primary"
                  >
                    Edit
                  </button>
                </>
              ) : (
                <button className="lux-btn lux-btn-primary" onClick={addToCartHandler}>
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

// Export so listing pages can render cards.
export default ProductCard;
