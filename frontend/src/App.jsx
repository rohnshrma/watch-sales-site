import React from "react";
import { Routes, Route } from "react-router-dom";
import AddProduct from "./Pages/AddProduct";
import Nav from "./Components/Nav";
import Home from "./Pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import ProductPage from "./Pages/ProductPage";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import ManageProducts from "./Pages/Admin/ManageProducts";
import EditProduct from "./Pages/Admin/EditProduct";
import Register from "./Pages/Register";

const App = () => {
  return (
    <>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-products" element={<ManageProducts />} />
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        <Route path="/user/register" element={<Register />} />
      </Routes>

      {/* <Footer /> */}
    </>
  );
};

export default App;
