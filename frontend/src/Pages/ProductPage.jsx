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

  if (!product) return <p>Loading Product...</p>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid"
          />
        </div>

        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <h4>₹{Number(product.price).toLocaleString("en-IN")}</h4>
          {message ? <p className="text-success mt-2">{message}</p> : null}
          {error ? <p className="text-danger mt-2">{error}</p> : null}

          <button className="btn btn-dark mt-3" onClick={addToCartHandler}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
