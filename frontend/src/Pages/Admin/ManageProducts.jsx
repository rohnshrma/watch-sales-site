import React, { useContext, useEffect, useState } from "react";
import ProductContext from "../../context/ProductContext";
import ProductCard from "../../Components/ProductCard";

const ManageProducts = () => {
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

  console.log(products);

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
    <div className="manage-products-page container">
      {products.length === 0 ? (
        <div className="empty-state">
          <h4>📦 No products available yet</h4>
          <p>Start building your collection by adding your first product!</p>
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <ProductCard key={product._id} isAdmin={true} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
