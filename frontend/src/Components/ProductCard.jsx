import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ProductContext from "../context/ProductContext";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";

const ProductCard = ({ product, isAdmin }) => {
  const navigate = useNavigate();

  const { deleteProduct } = useContext(ProductContext);
  const { addProductToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  const addToCartHandler = async () => {
    if (!isAuthenticated) {
      navigate("/user/login");
      return;
    }

    try {
      await addProductToCart(product._id, 1);
      alert("Added to cart!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add item to cart");
    }
  };

  return (
    <div className="col-xl-4 col-md-6 mb-4">
      <div className="product-card">
        <div
          className="product-image-section"
          onClick={() => {
            navigate(`/product/${product._id}`);
          }}
        >
          <img
            src={product.imageUrl}
            className="product-image"
            alt={product.name}
          />
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>

          <div className="product-tags">
            <span className="product-tag">Curated Piece</span>
          </div>

          <p className="product-desc">{product.description}</p>

          <div className="product-bottom">
            <div className="price-section">
              <span className="price-label">PRICE</span>
              <span className="price-value">₹{product.price}</span>
            </div>

            <div className="action-section">
              {isAdmin ? (
                <>
                  <button
                    className="delete-btn"
                    onClick={() => deleteProduct(product._id)}
                  >
                    Delete
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/admin/edit-product/${product._id}`)
                    }
                    className="edit-product-btn"
                  >
                    Edit
                  </button>
                </>
              ) : (
                <button className="add-to-cart-btn" onClick={addToCartHandler}>
                  Add to cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
