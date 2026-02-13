import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductContext from "../context/ProductContext";

const ProductPage = () => {
  const { id } = useParams();
  const { product, fetchProduct } = useContext(ProductContext);

  useEffect(() => {
    fetchProduct(id);
  }, [id]);

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

          <button className="btn btn-dark mt-3">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
