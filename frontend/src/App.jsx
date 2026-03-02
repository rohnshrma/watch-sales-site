// React is required for JSX transformation in this file.
import React from "react";
// Routes and Route map URL paths to page components.
import { Routes, Route } from "react-router-dom";
// Shared top navigation displayed on every page.
import Nav from "./Components/Nav";
// Home page showing product listing/search/sort.
import Home from "./Pages/Home";
// Global app-level styles for the current brand.
import "./App.css";
// Product details page for a specific product id.
import ProductPage from "./Pages/ProductPage";
// Cart page with item update/remove/clear actions.
import Cart from "./Pages/Cart";
// Product creation page for management.
import AddProduct from "./Pages/AddProduct";
// Product management list page with edit/delete controls.
import ManageProducts from "./Pages/Admin/ManageProducts";
// Product edit form page for a selected product.
import EditProduct from "./Pages/Admin/EditProduct";

// Root component defines layout + routing table for the frontend.
const App = () => {
  return (
    <>
      {/* Nav remains visible across all routes. */}
      <Nav />

      {/* Route tree for the cart-brand scope. */}
      <Routes>
        {/* Product storefront homepage. */}
        <Route path="/" element={<Home />} />
        {/* Dynamic product detail route by product id. */}
        <Route path="/product/:id" element={<ProductPage />} />
        {/* Public cart page route. */}
        <Route path="/cart" element={<Cart />} />
        {/* Public product create route (management). */}
        <Route path="/add-product" element={<AddProduct />} />
        {/* Public product list/manage route (management). */}
        <Route path="/manage-products" element={<ManageProducts />} />
        {/* Public product edit route with dynamic id. */}
        <Route path="/edit-product/:id" element={<EditProduct />} />
      </Routes>
    </>
  );
};

// Export App so main.jsx can mount it.
export default App;
