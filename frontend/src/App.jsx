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
import Login from "./Pages/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import Profile from "./Pages/Profile";

const App = () => {
  return (
    <>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-products"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManageProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-product/:id"
          element={
            <ProtectedRoute requireAdmin={true}>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route path="/user/register" element={<Register />} />
        <Route path="/user/login" element={<Login />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* <Footer /> */}
    </>
  );
};

export default App;
