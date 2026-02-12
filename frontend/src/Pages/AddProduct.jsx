import React, { useReducer, useContext } from "react";
import ProductContext from "../context/ProductContext";

const initialState = {
  title: "",
  description: "",
  price: "",
  imageUrl: "",
};

const productReducer = (state, action) => {
  if (
    action.type === "description" ||
    action.type === "title" ||
    action.type === "price" ||
    action.type === "imageUrl"
  ) {
    return {
      ...state,
      [action.type]: action.payload,
    };
  } else if (action.type === "RESET") {
    return initialState;
  } else {
    return state;
  }
};

const AddProduct = () => {
  const [product, dispatch] = useReducer(productReducer, initialState);

  const { addNewProduct } = useContext(ProductContext);

  const changeHandler = (e) => {
    const { value, name } = e.target;
    dispatch({ type: name, payload: value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    await addNewProduct(product);
    dispatch({ type: "RESET" });
  };

  return (
    <div className="add-product container jumbotron">
      <h1>Add New Product</h1>
      <hr />
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <input
            onChange={changeHandler}
            type="text"
            name="title"
            placeholder="Product Title"
            className="form-control"
            value={product.title}
          />
        </div>
        <div className="form-group">
          <textarea
            onChange={changeHandler}
            name="description"
            placeholder="Product Description"
            className="form-control"
            value={product.description}
          ></textarea>
        </div>
        <div className="form-group">
          <input
            onChange={changeHandler}
            type="text"
            name="price"
            placeholder="Price"
            className="form-control"
            value={product.price}
          />
        </div>
        <div className="form-group">
          <input
            onChange={changeHandler}
            type="text"
            name="imageUrl"
            value={product.imageUrl}
            placeholder="Image URL"
            className="form-control"
          />
        </div>
        <button className="btn btn-success">ADD PRODUCT</button>
      </form>
    </div>
  );
};

export default AddProduct;
