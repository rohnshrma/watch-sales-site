import axios from "axios";
import { act, createContext, useReducer } from "react";

const ProductContext = createContext();

const initialState = {
  products: [],
  product: null,
};
const productsReducer = (state, action) => {
  if (action.type === "ADD") {
    return {
      ...state,
      products: [action.payload, ...state.products],
    };
  } else if (action.type === "FETCH_PRODUCTS") {
    return {
      ...state,
      products: action.payload,
    };
  } else if (action.type === "FETCH_PRODUCT") {
    return {
      ...state,
      product: action.payload,
    };
  } else {
    return state;
  }
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productsReducer, initialState);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/products");
      console.log("Fetched products:", res.data);
      dispatch({ type: "FETCH_PRODUCTS", payload: res.data.data });
    } catch (err) {
      console.error("Error fetching products:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const fetchProduct = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/products/${id}`);
      console.log("Fetched product:", res.data);
      dispatch({ type: "FETCH_PRODUCT", payload: res.data.data });
    } catch (err) {
      console.error("Error fetching product:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/products/${id}`
      );
      console.log("Product Deleted:", res.data);
      await fetchProducts();
      console.log("success");
    } catch (err) {
      console.error("Error fetching product:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const editProduct = async (id, updatedProduct) => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/products/${id}`,
        updatedProduct
      );
      console.log("Updated", res.data);
      await fetchProducts();
      return res.data;
    } catch (err) {
      console.error("Error Updating product:", err);
      console.error("Error response:", err.response?.data);
      // Re-throw the error so it can be caught by the component
      throw err;
    }
  };

  const addNewProduct = async (product) => {
    try {
      console.log("Sending product data:", product);
      const res = await axios.post(
        "http://localhost:3000/api/products",
        product
      );
      console.log("Response:", res);
      dispatch({ type: "ADD", payload: res.data.data });
      return res.data;
    } catch (err) {
      console.error("Error adding product:", err);
      console.error("Error response:", err.response?.data);
      // Re-throw the error so it can be caught by the component
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

export default ProductContext;
