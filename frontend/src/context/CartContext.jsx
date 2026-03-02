// createContext shares cart state globally; hooks power reducer/effects/memoization.
import { createContext, useEffect, useMemo, useReducer } from "react";
// Shared API client used for cart requests.
import api from "../utils/api";

// Cart context consumed by nav, product pages, and cart page.
const CartContext = createContext();

// LocalStorage key for stable browser cart identity.
const CART_ID_STORAGE_KEY = "watchStoreCartId";

// Initial reducer state.
const initialState = {
  cartItems: [],
  total: 0,
  loading: false,
};

// Reducer updates loading flag and cart payload.
const cartReducer = (state, action) => {
  // Toggle loading state for async operations.
  if (action.type === "SET_LOADING") {
    return {
      ...state,
      loading: action.payload,
    };
  }

  // Replace cart items and total with backend response.
  if (action.type === "SET_CART") {
    return {
      ...state,
      cartItems: action.payload?.cartItems || [],
      total: action.payload?.total || 0,
      loading: false,
    };
  }

  // Unknown actions keep current state unchanged.
  return state;
};

// Generates an id format suitable for x-cart-id header.
const createCartId = () => `cart_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

// Reads existing cart id from localStorage or creates one if missing.
const getOrCreateCartId = () => {
  const existing = localStorage.getItem(CART_ID_STORAGE_KEY);
  if (existing && existing.trim()) return existing;
  const newCartId = createCartId();
  localStorage.setItem(CART_ID_STORAGE_KEY, newCartId);
  return newCartId;
};

// Provider exposes cart state + cart actions to all children.
export const CartProvider = ({ children }) => {
  // Reducer wiring.
  const [state, dispatch] = useReducer(cartReducer, initialState);
  // Stable cart id per browser profile/session storage.
  const cartId = useMemo(() => getOrCreateCartId(), []);
  // Pre-built headers object reused by every cart API call.
  const cartHeaders = useMemo(() => ({ "x-cart-id": cartId }), [cartId]);

  // Fetch current cart for this cart id.
  const fetchCart = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.get("/api/cart", { headers: cartHeaders });
      dispatch({ type: "SET_CART", payload: res.data.data });
      return res.data;
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  // Add item to cart by accepting either a product object or direct id.
  const addProductToCart = async (productOrId, quantity = 1) => {
    const productId =
      typeof productOrId === "string" ? productOrId : productOrId?._id || productOrId?.id;
    const res = await api.post(
      "/api/cart",
      { productId, quantity },
      { headers: cartHeaders }
    );
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  // Update quantity for one cart item.
  const updateCartItem = async (productId, quantity) => {
    const res = await api.put(
      "/api/cart",
      { productId, quantity },
      { headers: cartHeaders }
    );
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  // Remove one cart item by product id.
  const removeCartItem = async (productId) => {
    const res = await api.delete(`/api/cart/${productId}`, {
      headers: cartHeaders,
    });
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  // Clear all items in the cart.
  const clearCart = async () => {
    const res = await api.delete("/api/cart/clear", {
      headers: cartHeaders,
    });
    dispatch({ type: "SET_CART", payload: res.data.data });
    return res.data;
  };

  // Auto-load cart once provider mounts.
  useEffect(() => {
    fetchCart().catch((error) => {
      console.error("Failed to fetch cart:", error);
    });
  }, [cartId]);

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
