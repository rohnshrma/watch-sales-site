import { createContext, useContext, useEffect, useReducer } from "react";
import AuthContext from "./AuthContext";
import api from "../utils/api";

const CartContext = createContext();

const initialState = {
  cartItems: [],
  total: 0,
  loading: false,
};

const cartReducer = (state, action) => {
  if (action.type === "SET_LOADING") {
    return {
      ...state,
      loading: action.payload,
    };
  }

  if (action.type === "SET_CART") {
    return {
      ...state,
      cartItems: action.payload?.cartItems || [],
      total: action.payload?.total || 0,
      loading: false,
    };
  }

  if (action.type === "RESET_CART") {
    return initialState;
  }

  return state;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { token, isAuthenticated, authHeaders } = useContext(AuthContext);

  const fetchCart = async () => {
    if (!token) {
      dispatch({ type: "RESET_CART" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.get("/api/cart", {
        headers: authHeaders,
      });
      dispatch({ type: "SET_CART", payload: res.data.data });
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const addProductToCart = async (productId, quantity = 1) => {
    const res = await api.post(
      "/api/cart",
      { productId, quantity },
      { headers: authHeaders }
    );
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  const updateCartItem = async (productId, quantity) => {
    const res = await api.put(
      "/api/cart",
      { productId, quantity },
      { headers: authHeaders }
    );
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  const removeCartItem = async (productId) => {
    const res = await api.delete(`/api/cart/${productId}`, {
      headers: authHeaders,
    });
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  const clearCart = async () => {
    const res = await api.delete("/api/cart/clear", {
      headers: authHeaders,
    });
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch((error) => {
        console.error("Failed to fetch cart:", error);
      });
      return;
    }
    dispatch({ type: "RESET_CART" });
  }, [isAuthenticated, token]);

  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        total: state.total,
        loading: state.loading,
        fetchCart,
        addProductToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
