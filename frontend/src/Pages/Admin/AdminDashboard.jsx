import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const Navigate = useNavigate();
  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Admin Dashboard</h2>

      <div className="row">
        {/* Orders */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm text-center h-100">
            <div className="card-body">
              <h5 className="card-title text-muted">Orders</h5>
              <h1 className="display-4 font-weight-bold">128</h1>
              <p className="text-secondary">Total Orders</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div
          className="col-md-4 mb-4"
          onClick={() => Navigate("/admin/manage-products")}
        >
          <div className="card shadow-sm text-center h-100">
            <div className="card-body">
              <h5 className="card-title text-muted">Products</h5>
              <h1 className="display-4 font-weight-bold">54</h1>
              <p className="text-secondary">Active Products</p>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm text-center h-100">
            <div className="card-body">
              <h5 className="card-title text-muted">Customers</h5>
              <h1 className="display-4 font-weight-bold">320</h1>
              <p className="text-secondary">Registered Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
