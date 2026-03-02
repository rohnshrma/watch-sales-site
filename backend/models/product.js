// Mongoose is used for MongoDB schema/model definition.
import mongoose from "mongoose";

// Product schema defines the persistent product structure.
const productSchema = new mongoose.Schema(
  {
    // Product display name.
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 5,
    },
    // Product price stored as numeric value.
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Long-form product description.
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    // Public image URL for product thumbnail/detail display.
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  // timestamps adds createdAt/updatedAt automatically.
  { timestamps: true }
);

// Create Product model from schema.
const Product = mongoose.model("Product", productSchema);

// Export model for controller usage.
export default Product;
