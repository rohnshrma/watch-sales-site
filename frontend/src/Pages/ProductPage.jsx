import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductContext from "../context/ProductContext";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";

const ProductPage = () => {
  const { id } = useParams();
  const { product, fetchProduct } = useContext(ProductContext);
  const { addProductToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct(id);
  }, [id]);

  const addToCartHandler = async () => {
    if (!isAuthenticated) {
      navigate("/user/login");
      return;
    }

    setMessage("");
    setError("");
    try {
      await addProductToCart(product._id, 1);
      setMessage("Added to cart");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (!product) return <div className="page-shell page-shell--center">Loading product...</div>;

  return (
    <div className="page-shell">
      <div className="product-detail row align-items-center">
        <div className="col-md-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid product-detail__image"
          />
        </div>

        <div className="col-md-6">
          <p className="page-eyebrow">Product Detail</p>
          <h2>{product.name}</h2>
          <p className="product-detail__description">{product.description}</p>
          <h4 className="product-detail__price">₹{Number(product.price).toLocaleString("en-IN")}</h4>
          {message ? <p className="text-success mt-2">{message}</p> : null}
          {error ? <p className="text-danger mt-2">{error}</p> : null}

          <button className="btn app-btn app-btn--primary mt-3" onClick={addToCartHandler}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
