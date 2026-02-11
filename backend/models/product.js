import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 5,
  },
  price: { type: String, required: true, trim: true, minlength: 2 },
  description: { type: String, required: true, trim: true, minlength: 20 },
  imageUrl: { type: String, required: true, trim: true },
});

const Product = mongoose.model("product", productSchema);

export default Product;
