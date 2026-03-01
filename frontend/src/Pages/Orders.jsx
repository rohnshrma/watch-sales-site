import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import OrderContext from "../context/OrderContext";

const Orders = () => {
  const { orders, loading, fetchOrders, cancelOrder } = useContext(OrderContext);
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
    <div className="container mt-5">
      <h2 className="mb-4">Your Orders</h2>
      {createdOrderId ? (
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
        <div className="card mb-3" key={order._id}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <h5>Order #{order._id}</h5>
                <p className="mb-1">Status: {order.status}</p>
                <p className="mb-1">Payment: {order.paymentStatus}</p>
                <p className="mb-0">
                  Total: ₹{Number(order.total).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right mt-2 mt-md-0">
                <small className="text-muted d-block mb-2">
                  {new Date(order.createdAt).toLocaleString()}
                </small>
                <button
                  className="btn btn-outline-danger btn-sm"
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
