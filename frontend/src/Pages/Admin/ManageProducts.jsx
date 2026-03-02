// React hooks for context access, async load lifecycle, and loading flag.
import React, { useContext, useEffect, useState } from "react";
// Product context provides product list + fetch action.
import ProductContext from "../../context/ProductContext";
// ProductCard supports management action mode.
import ProductCard from "../../Components/ProductCard";

// Page to list all products with edit/delete actions.
const ManageProducts = () => {
  // Product list and fetch action from context.
  const { products, fetchProducts } = useContext(ProductContext);
  // Local loading state while data is requested.
  const [loading, setLoading] = useState(true);

  // Load products once on mount.
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    loadProducts();
  }, []);

  // Show a loading indicator during initial request.
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
          <h4>No products available yet</h4>
          <p>Start building your collection by adding your first product.</p>
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <ProductCard key={product._id} showManageActions={true} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

// Export page for route configuration.
export default ManageProducts;
