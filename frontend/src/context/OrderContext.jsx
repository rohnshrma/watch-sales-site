import { createContext, useContext, useReducer } from "react";
import AuthContext from "./AuthContext";
import api from "../utils/api";

const OrderContext = createContext();

const initialState = {
  orders: [],
  loading: false,
};

const orderReducer = (state, action) => {
  if (action.type === "SET_LOADING") {
    return { ...state, loading: action.payload };
  }

  if (action.type === "SET_ORDERS") {
    return { ...state, orders: action.payload || [], loading: false };
  }

  if (action.type === "RESET") {
    return initialState;
  }

  return state;
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { authHeaders, token } = useContext(AuthContext);

  const fetchOrders = async () => {
    if (!token) {
      dispatch({ type: "RESET" });
      return [];
    }
    dispatch({ type: "SET_LOADING", payload: true });
    const res = await api.get("/api/orders", { headers: authHeaders });
    dispatch({ type: "SET_ORDERS", payload: res.data.data });
    return res.data.data;
  };

  const createOrder = async (payload) => {
    const res = await api.post("/api/orders", payload, { headers: authHeaders });
    return res.data.data;
  };

  const cancelOrder = async (orderId) => {
    const res = await api.put(
      `/api/orders/${orderId}/cancel`,
      {},
      { headers: authHeaders }
    );
    return res.data.data;
  };

  return (
    <OrderContext.Provider
      value={{
        orders: state.orders,
        loading: state.loading,
        fetchOrders,
        createOrder,
        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
