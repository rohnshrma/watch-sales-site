import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../utils/api";

const getRecentOrderStatusClass = (status) => {
  const statusMap = {
    pending: "admin-order-row--pending",
    confirmed: "admin-order-row--confirmed",
    shipped: "admin-order-row--shipped",
    delivered: "admin-order-row--delivered",
    cancelled: "admin-order-row--cancelled",
  };

  return statusMap[status] || "admin-order-row--default";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { authHeaders, user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/users/admin/dashboard", {
          headers: authHeaders,
        });
        setDashboard(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [authHeaders]);

  const totals = dashboard?.totals || {};
  const statCards = [
    {
      title: "Active Users",
      value: totals.activeUsers || 0,
      note: `${totals.totalUsers || 0} total accounts`,
      tone: "admin-stat-card--users",
    },
    {
      title: "Pending Orders",
      value: totals.pendingOrders || 0,
      note: "Needs review or fulfillment",
      tone: "admin-stat-card--pending",
    },
    {
      title: "Completed Orders",
      value: totals.completedOrders || 0,
      note: "Successfully paid orders",
      tone: "admin-stat-card--completed",
    },
    {
      title: "Products",
      value: totals.totalProducts || 0,
      note: "Items currently listed",
      tone: "admin-stat-card--products",
    },
  ];

  const quickActions = [
    {
      title: "Manage Products",
      copy: "Edit listings, prices, and images.",
      path: "/admin/manage-products",
    },
    {
      title: "Add Product",
      copy: "Create a new product for the storefront.",
      path: "/add-product",
    },
    {
      title: "Review Orders",
      copy: "Check pending and completed customer orders.",
      path: "/orders",
    },
    {
      title: "Manage Profile",
      copy: "Update your admin account details.",
      path: "/profile",
    },
  ];

  return (
    <div className="container mt-5">
      <div className="admin-dashboard">
        <div className="admin-dashboard__hero">
          <div>
            <p className="admin-dashboard__eyebrow">Admin Overview</p>
            <h2 className="mb-2">Welcome back, {user?.name?.split(" ")[0] || "Admin"}</h2>
            <p className="admin-dashboard__subtext">
              Track store performance, monitor orders, and jump into the most
              important admin actions from one place.
            </p>
          </div>
          <div className="admin-dashboard__hero-card">
            <span className="admin-dashboard__hero-label">Revenue</span>
            <strong>₹{Number(totals.totalRevenue || 0).toLocaleString("en-IN")}</strong>
            <span className="admin-dashboard__hero-meta">
              From {totals.completedOrders || 0} completed orders
            </span>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : null}

        {!loading ? (
          <>
            <div className="row">
              {statCards.map((card) => (
                <div className="col-md-6 col-xl-3 mb-4" key={card.title}>
                  <div className={`admin-stat-card ${card.tone}`}>
                    <p className="admin-stat-card__label">{card.title}</p>
                    <h3 className="admin-stat-card__value">{card.value}</h3>
                    <p className="admin-stat-card__note">{card.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="row">
              <div className="col-lg-7 mb-4">
                <div className="admin-panel">
                  <div className="admin-panel__header">
                    <div>
                      <h4 className="mb-1">Recent Orders</h4>
                      <p className="admin-panel__subtext mb-0">
                        Latest customer activity across the store.
                      </p>
                    </div>
                    <button
                      className="admin-panel__link"
                      onClick={() => navigate("/orders")}
                    >
                      View all orders
                    </button>
                  </div>

                  {dashboard?.recentOrders?.length ? (
                    <div className="admin-order-list">
                      {dashboard.recentOrders.map((order) => (
                        <div
                          className={`admin-order-row ${getRecentOrderStatusClass(
                            order.status
                          )}`}
                          key={order._id}
                        >
                          <div>
                            <p className="admin-order-row__title">
                              {order.user?.name || "Customer"}
                            </p>
                            <p className="admin-order-row__meta mb-0">
                              {order.user?.email || "No email"} · Order #{order._id.slice(-6)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="admin-order-row__amount">
                              ₹{Number(order.total || 0).toLocaleString("en-IN")}
                            </p>
                            <p className="admin-order-row__meta mb-0 text-capitalize">
                              {order.status} · {order.paymentStatus}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-light mb-0">No recent orders found.</div>
                  )}
                </div>
              </div>

              <div className="col-lg-5 mb-4">
                <div className="admin-panel">
                  <div className="admin-panel__header">
                    <div>
                      <h4 className="mb-1">Quick Actions</h4>
                      <p className="admin-panel__subtext mb-0">
                        Shortcuts for common admin work.
                      </p>
                    </div>
                  </div>

                  <div className="admin-action-list">
                    {quickActions.map((action) => (
                      <button
                        className="admin-action-card"
                        key={action.title}
                        onClick={() => navigate(action.path)}
                      >
                        <span className="admin-action-card__title">{action.title}</span>
                        <span className="admin-action-card__copy">{action.copy}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;
