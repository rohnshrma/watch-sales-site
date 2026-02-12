import axios from "axios";
import { createContext, useReducer } from "react";

const ProductContext = createContext();

const initialState = [];
const productsReducer = (state, action) => {
  if (action.type === "ADD") {
    return [action.payload, ...state];
  } else {
    return state;
  }
};

export const ProductProvider = ({ children }) => {
  const [products, dispatch] = useReducer(productsReducer, initialState);

  const addNewProduct = async (product) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/products",
        product
      );
      console.log(res);
      dispatch({ type: "ADD", payload: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ProductContext.Provider value={{ products, addNewProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
