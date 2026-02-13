import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="product-card">
        <div className="product-image-section">
          <img
            src={product.imageUrl}
            className="product-image"
            alt={product.name}
          />
          <button className="favorite-btn">
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
          </button>
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>

          <div className="product-tags">
            <span className="product-tag">Watch</span>
          </div>

          <p className="product-desc">{product.description}</p>

          <div className="product-bottom">
            <div className="price-section">
              <span className="price-label">PRICE</span>
              <span className="price-value">₹{product.price}</span>
            </div>
            <button className="add-to-cart-btn">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
