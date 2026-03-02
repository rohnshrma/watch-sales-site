// createContext exposes a shared store; useReducer centralizes state updates.
import { createContext, useReducer } from "react";
// Shared Axios client with environment-aware base URL.
import api from "../utils/api";

// Product context object consumed by pages/components.
const ProductContext = createContext();

// Initial state includes product list and currently selected product.
const initialState = {
  products: [],
  product: null,
};

// Reducer handles immutable state transitions for product actions.
const productsReducer = (state, action) => {
  // Prepend newly created product for immediate UI reflection.
  if (action.type === "ADD") {
    return {
      ...state,
      products: [action.payload, ...state.products],
    };
  }

  // Replace list when fetching all products.
  if (action.type === "FETCH_PRODUCTS") {
    return {
      ...state,
      products: action.payload,
    };
  }

  // Replace currently viewed product for detail page.
  if (action.type === "FETCH_PRODUCT") {
    return {
      ...state,
      product: action.payload,
    };
  }

  // Fallback for unknown actions.
  return state;
};

// Provider wraps the app and exposes product state + API operations.
export const ProductProvider = ({ children }) => {
  // Reducer state and dispatcher.
  const [state, dispatch] = useReducer(productsReducer, initialState);

  // Fetch full product catalog.
  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
      dispatch({ type: "FETCH_PRODUCTS", payload: res.data.data });
    } catch (err) {
      console.error("Error fetching products:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  // Fetch one product by id.
  const fetchProduct = async (id) => {
    try {
      const res = await api.get(`/api/products/${id}`);
      dispatch({ type: "FETCH_PRODUCT", payload: res.data.data });
    } catch (err) {
      console.error("Error fetching product:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  // Delete product by id, then refresh list.
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/api/products/${id}`);
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  // Update product by id, refresh list, and return backend payload.
  const editProduct = async (id, updatedProduct) => {
    try {
      const res = await api.put(`/api/products/${id}`, updatedProduct);
      await fetchProducts();
      return res.data;
    } catch (err) {
      console.error("Error updating product:", err);
      console.error("Error response:", err.response?.data);
      throw err;
    }
  };

  // Create new product and optimistically add to local list.
  const addNewProduct = async (product) => {
    try {
      const res = await api.post("/api/products", product);
      dispatch({ type: "ADD", payload: res.data.data });
      return res.data;
    } catch (err) {
      console.error("Error adding product:", err);
      console.error("Error response:", err.response?.data);
      throw err;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products: state.products,
        product: state.product,
        addNewProduct,
        fetchProducts,
        fetchProduct,
        deleteProduct,
        editProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Export context for useContext consumers.
export default ProductContext;
