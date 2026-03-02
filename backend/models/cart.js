// Mongoose is used to define cart document and subdocument schemas.
import mongoose from "mongoose";

// Embedded schema for each cart line item.
const cartItemSchema = new mongoose.Schema(
  {
    // Product reference for relation to product collection.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // Snapshot name saved at add-to-cart time.
    name: {
      type: String,
      required: true,
    },
    // Snapshot image url saved at add-to-cart time.
    imageUrl: {
      type: String,
      required: true,
    },
    // Snapshot price saved at add-to-cart time.
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Quantity for this line item.
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  // Disable separate _id for each item subdocument to keep payload smaller.
  { _id: false }
);

// Main cart schema identified by cartId (header-driven identity).
const cartSchema = new mongoose.Schema(
  {
    // Unique cart id string coming from x-cart-id header.
    cartId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Array of cart line items.
    cartItems: [cartItemSchema],
    // Cached total amount for cart.
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  // timestamps adds createdAt/updatedAt.
  { timestamps: true }
);

// Create Cart model from schema.
const Cart = mongoose.model("Cart", cartSchema);

// Export model for cart controller usage.
export default Cart;
