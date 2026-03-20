import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import OrderContext from "../context/OrderContext";
import AuthContext from "../context/AuthContext";

const getOrderStatusClass = (status) => {
  const statusMap = {
    pending: "order-card--pending",
    confirmed: "order-card--confirmed",
    shipped: "order-card--shipped",
    delivered: "order-card--delivered",
    cancelled: "order-card--cancelled",
  };

  return statusMap[status] || "order-card--default";
};

const getPaymentStatusClass = (status) => {
  const statusMap = {
    pending: "order-pill--pending",
    completed: "order-pill--completed",
    failed: "order-pill--failed",
  };

  return statusMap[status] || "order-pill--neutral";
};

const Orders = () => {
  const { orders, loading, fetchOrders, cancelOrder } = useContext(OrderContext);
  const { isAdmin } = useContext(AuthContext);
  const [error, setError] = useState("");
  const location = useLocation();
  const createdOrderId = location.state?.createdOrderId;

  useEffect(() => {
    fetchOrders().catch((err) => {
      setError(err.response?.data?.message || "Failed to load orders");
    });
  }, []);

  const onCancel = async (orderId) => {
    setError("");
    try {
      await cancelOrder(orderId);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">{isAdmin ? "Admin" : "Orders"}</p>
          <h2>{isAdmin ? "All Orders" : "Your Orders"}</h2>
          <p className="page-subtext">
            {isAdmin
              ? "Monitor customer activity and payment progress in one place."
              : "Track your order history, payment state, and delivery progress."}
          </p>
        </div>
      </div>
      {!isAdmin && createdOrderId ? (
        <div className="alert alert-success">
          Order created successfully: {createdOrderId}
        </div>
      ) : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : null}
      {!loading && orders.length === 0 ? (
        <div className="alert alert-info">No orders found.</div>
      ) : null}
      {orders.map((order) => (
        <div
          className={`card mb-3 order-card ${getOrderStatusClass(order.status)}`}
          key={order._id}
        >
          <div className="card-body order-card__body">
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <h5>Order #{order._id}</h5>
                {isAdmin && order.user ? (
                  <p className="mb-1 order-card__customer">
                    Customer: {order.user.name} ({order.user.email})
                  </p>
                ) : null}
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className={`order-pill ${getOrderStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                  <span
                    className={`order-pill ${getPaymentStatusClass(
                      order.paymentStatus
                    )}`}
                  >
                    Payment: {order.paymentStatus}
                  </span>
                </div>
                <p className="mb-1">Method: {order.paymentMethod}</p>
                <p className="mb-0">
                  Total: ₹{Number(order.total).toLocaleString("en-IN")}
                </p>
                {order.paymentReferenceId ? (
                  <small className="text-muted d-block mt-2">
                    Razorpay Payment ID: {order.paymentReferenceId}
                  </small>
                ) : null}
              </div>
              <div className="text-right mt-2 mt-md-0">
                <small className="text-muted d-block mb-2">
                  {new Date(order.createdAt).toLocaleString()}
                </small>
                {order.paidAt ? (
                  <small className="text-success d-block mb-2">
                    Paid at: {new Date(order.paidAt).toLocaleString()}
                  </small>
                ) : null}
                <button
                  className="btn btn-outline-danger btn-sm order-card__cancel"
                  onClick={() => onCancel(order._id)}
                  disabled={[
                    "cancelled",
                    "shipped",
                    "delivered",
                  ].includes(order.status)}
                >
                  Cancel
                </button>
              </div>
            </div>
            <hr />
            {order.orderItems.map((item) => (
              <div
                key={`${order._id}-${item.product?._id || item.name}`}
                className="d-flex justify-content-between"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{Number(item.price).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
