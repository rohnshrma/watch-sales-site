import React, { useContext, useEffect, useState } from "react";
import ProductContext from "../context/ProductContext";
import ProductCard from "../Components/ProductCard";

const Home = () => {
  const { products, fetchProducts } = useContext(ProductContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    loadProducts();
  }, []);

  // empty square brackets represents an empty dependency array , which make sures that the use effect
  // runs only once that too when the react app loads for the first time

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="home-page container">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap">
        <h1>🛍️ Our Collection</h1>
        <span className="product-count-badge">
          {products.length} {products.length === 1 ? "Product" : "Products"}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h4>📦 No products available yet</h4>
          <p>Start building your collection by adding your first product!</p>
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
