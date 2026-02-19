import { createContext, useReducer } from "react";

const CartContext = createContext();

const initialState = {
  cartItems: [],
  total: 0,
};

const cartReducer = (state, action) => {
  return state;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addProductToCart = (product) => {
    dispatch({ type: "ADD", payload: product });
  };

  return (
    <CartContext.Provider
      value={{ cartItems: state.cartItems, total: state.total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
