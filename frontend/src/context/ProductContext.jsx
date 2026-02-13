import axios from "axios";
import { createContext, useReducer } from "react";

const ProductContext = createContext();

const initialState = [];
const productsReducer = (state, action) => {
  if (action.type === "ADD") {
    return [action.payload, ...state];
  } else if (action.type === "FETCH") {
    return action.payload;
  } else {
    return state;
  }
};

export const ProductProvider = ({ children }) => {
  const [products, dispatch] = useReducer(productsReducer, initialState);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/products");
      console.log("Fetched products:", res.data);
      dispatch({ type: "FETCH", payload: res.data.data });
    } catch (err) {
      console.error("Error fetching products:", err);
      console.error("Error response:", err.response?.data);
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
    <ProductContext.Provider value={{ products, addNewProduct, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
