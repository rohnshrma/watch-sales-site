// React hooks for reducer-based form state, context actions, and status messages.
import React, { useReducer, useContext, useState } from "react";
// Product context exposes product creation and list refresh actions.
import ProductContext from "../context/ProductContext";

// Initial form values for new product creation.
const initialState = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
};

// Reducer to update one field at a time or reset the full form.
const productReducer = (state, action) => {
  if (
    action.type === "description" ||
    action.type === "name" ||
    action.type === "price" ||
    action.type === "imageUrl"
  ) {
    return {
      ...state,
      [action.type]: action.payload,
    };
  }

  if (action.type === "RESET") {
    return initialState;
  }

  return state;
};

// Add-product page with simple client-side validation.
const AddProduct = () => {
  // Form model state.
  const [product, dispatch] = useReducer(productReducer, initialState);
  // Error feedback state.
  const [error, setError] = useState("");
  // Success feedback state.
  const [success, setSuccess] = useState("");

  // Actions provided by product context.
  const { addNewProduct, fetchProducts } = useContext(ProductContext);

  // Generic input/textarea change handler.
  const changeHandler = (e) => {
    const { value, name } = e.target;
    dispatch({ type: name, payload: value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  // Basic client-side validation before API submit.
  const validateForm = () => {
    if (
      !product.name ||
      !product.price ||
      !product.description ||
      !product.imageUrl
    ) {
      setError("All fields are required");
      return false;
    }

    if (product.name.length < 5) {
      setError("Product name must be at least 5 characters long");
      return false;
    }

    if (product.description.length < 20) {
      setError("Description must be at least 20 characters long");
      return false;
    }

    if (product.price.length < 2) {
      setError("Price must be at least 2 characters long");
      return false;
    }

    return true;
  };

  // Submit handler calls create endpoint and resets form on success.
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      await addNewProduct(product);
      setSuccess("Product added successfully!");
      dispatch({ type: "RESET" });
      await fetchProducts();
    } catch (err) {
      console.log(err);
      setError("Failed to add product. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="add-product">
        <h1>Add New Product</h1>
        <hr />
        {error && (
          <div className="alert alert-danger" role="alert">
            <strong>Error!</strong> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            <strong>Success!</strong> {success}
          </div>
        )}
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="productName">
              <strong>Product Name</strong>
            </label>
            <input
              onChange={changeHandler}
              type="text"
              name="name"
              id="productName"
              placeholder="Enter product name (min. 5 characters)"
              className="form-control"
              value={product.name}
            />
          </div>
          <div className="form-group">
            <label htmlFor="productDescription">
              <strong>Description</strong>
            </label>
            <textarea
              onChange={changeHandler}
              name="description"
              id="productDescription"
              placeholder="Enter product description (min. 20 characters)"
              className="form-control"
              value={product.description}
              rows="4"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="productPrice">
              <strong>Price (₹)</strong>
            </label>
            <input
              onChange={changeHandler}
              type="text"
              name="price"
              id="productPrice"
              placeholder="Enter price (e.g., 2999)"
              className="form-control"
              value={product.price}
            />
          </div>
          <div className="form-group">
            <label htmlFor="productImage">
              <strong>Image URL</strong>
            </label>
            <input
              onChange={changeHandler}
              type="text"
              name="imageUrl"
              id="productImage"
              value={product.imageUrl}
              placeholder="Enter image URL"
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-success btn-lg btn-block">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

// Export page for routing.
export default AddProduct;
