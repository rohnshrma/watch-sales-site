// createContext shares cart state globally; hooks power reducer/effects.
import { createContext, useContext, useEffect, useReducer } from "react";
// Shared API client used for cart requests.
import api from "../utils/api";
// Auth context provides token/auth headers and login state.
import AuthContext from "./AuthContext";

// Cart context consumed by nav, product pages, and cart page.
const CartContext = createContext();

// Initial reducer state.
const initialState = {
  cartItems: [],
  total: 0,
  loading: false,
};

// Reducer updates loading flag and cart payload.
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

// Provider exposes cart state + cart actions to all children.
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  // Read auth context for protected cart API usage.
  const { token, isAuthenticated, authHeaders } = useContext(AuthContext);

  // Fetch current cart for the authenticated user.
  const fetchCart = async () => {
    if (!token) {
      dispatch({ type: "RESET_CART" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.get("/api/cart", { headers: authHeaders });
      dispatch({ type: "SET_CART", payload: res.data.data });
      return res.data;
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  // Add one product to authenticated user's cart.
  const addProductToCart = async (productOrId, quantity = 1) => {
    const productId =
      typeof productOrId === "string" ? productOrId : productOrId?._id || productOrId?.id;

    const res = await api.post(
      "/api/cart",
      { productId, quantity },
      { headers: authHeaders }
    );
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  // Update one cart item quantity.
  const updateCartItem = async (productId, quantity) => {
    const res = await api.put(
      "/api/cart",
      { productId, quantity },
      { headers: authHeaders }
    );
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  // Remove one cart item.
  const removeCartItem = async (productId) => {
    const res = await api.delete(`/api/cart/${productId}`, {
      headers: authHeaders,
    });
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  // Clear entire cart.
  const clearCart = async () => {
    const res = await api.delete("/api/cart/clear", {
      headers: authHeaders,
    });
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  // Keep cart synced with auth session.
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

// Export context object for consumers.
export default CartContext;
