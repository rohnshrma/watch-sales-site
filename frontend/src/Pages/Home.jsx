// React hooks for context access, async lifecycle, memoized filtering, and local UI state.
import React, { useContext, useEffect, useMemo, useState } from "react";
// Product context provides catalog data and fetch action.
import ProductContext from "../context/ProductContext";
// ProductCard is the reusable card used in the grid.
import ProductCard from "../Components/ProductCard";

// Home page renders catalog + search/sort controls.
const Home = () => {
  // Pull product list and fetch action from shared context.
  const { products, fetchProducts } = useContext(ProductContext);
  // Loading state for initial fetch UX.
  const [loading, setLoading] = useState(true);
  // Search keyword state for text filtering.
  const [searchTerm, setSearchTerm] = useState("");
  // Sort mode state (newest, price asc, price desc).
  const [sortBy, setSortBy] = useState("newest");

  // Fetch products once on page mount.
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    loadProducts();
  }, []);

  // Derived list based on search and selected sort option.
  const filteredProducts = useMemo(() => {
    // Normalize search input to case-insensitive matching.
    const normalizedQuery = searchTerm.trim().toLowerCase();
    // Filter by checking product name + description text.
    const result = products.filter((product) => {
      if (!normalizedQuery) return true;
      const searchable = `${product.name} ${product.description}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });

    // Apply selected sorting strategy.
    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return result;
  }, [products, searchTerm, sortBy]);

  // Show loader while initial catalog request is in progress.
  if (loading) {
    return (
      <div className="lux-shell lux-page">
        <div className="lux-loader-wrap">
          <div className="lux-spinner" role="status"></div>
          <p className="lux-muted">Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-shell lux-page">
      {/* Page heading with result count pill. */}
      <section className="lux-page-head">
        <h1 className="lux-title">Timeless Collection</h1>
        <span className="lux-pill">
          {filteredProducts.length}
          {filteredProducts.length !== products.length ? ` / ${products.length}` : ""}{" "}
          {filteredProducts.length === 1 ? "Piece" : "Pieces"}
        </span>
      </section>

      {/* Search + sort toolbar. */}
      <section className="product-toolbar">
        <input
          className="lux-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or description"
        />
        <select
          className="lux-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <button
          className="lux-btn lux-btn-ghost"
          onClick={() => setSearchTerm("")}
          disabled={!searchTerm}
        >
          Clear
        </button>
      </section>

      {/* Empty state or product grid depending on results. */}
      {filteredProducts.length === 0 ? (
        <div className="lux-empty">
          <h4>{products.length === 0 ? "No watches yet" : "No matching watches"}</h4>
          <p>
            {products.length === 0
              ? "Add your first luxury piece to begin the collection."
              : "Try another keyword or clear your filters."}
          </p>
        </div>
      ) : (
        <section className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
};

// Export page for route usage.
export default Home;
