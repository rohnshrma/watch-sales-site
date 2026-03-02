// React hooks for context access, route-driven data loading, and transient messages.
import React, { useContext, useEffect, useState } from "react";
// useParams reads dynamic route segments (here, product id).
import { useParams } from "react-router-dom";
// Product context supplies selected product and fetch action.
import ProductContext from "../context/ProductContext";
// Cart context supplies add-to-cart action.
import CartContext from "../context/CartContext";

// Product detail page.
const ProductPage = () => {
  // Extract `id` from `/product/:id` route.
  const { id } = useParams();
  // Access current product and fetch method from context.
  const { product, fetchProduct } = useContext(ProductContext);
  // Access cart action for adding the current product.
  const { addProductToCart } = useContext(CartContext);
  // Success message after add-to-cart.
  const [message, setMessage] = useState("");
  // Error message for failed add-to-cart attempts.
  const [error, setError] = useState("");

  // Refetch product when route id changes.
  useEffect(() => {
    fetchProduct(id);
  }, [id]);

  // Handles add-to-cart for the viewed product.
  const addToCartHandler = async () => {
    setMessage("");
    setError("");
    try {
      await addProductToCart(product, 1);
      setMessage("Added to cart");
    } catch (err) {
      setError(err.message || "Failed to add to cart");
    }
  };

  // Render loader while product detail is not yet available.
  if (!product) {
    return (
      <div className="lux-shell lux-page">
        <div className="lux-loader-wrap">
          <div className="lux-spinner" role="status"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-shell lux-page">
      <article className="product-detail-card">
        {/* Left panel image. */}
        <div className="product-detail-image-wrap">
          <img src={product.imageUrl} alt={product.name} className="product-detail-image" />
        </div>

        {/* Right panel textual details + CTA. */}
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <h3>₹{Number(product.price).toLocaleString("en-IN")}</h3>

          {message ? <p className="lux-text-success">{message}</p> : null}
          {error ? <p className="lux-text-danger">{error}</p> : null}

          <button className="lux-btn lux-btn-primary" onClick={addToCartHandler}>
            Add to Cart
          </button>
        </div>
      </article>
    </div>
  );
};

// Export page component for routing.
export default ProductPage;
