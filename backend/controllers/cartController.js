// Cart model provides DB operations for cart documents.
import Cart from "../models/cart.js";
// Product model is used to validate products before adding to cart.
import Product from "../models/product.js";

// Recompute cart total from current line items.
const getCartTotal = (cartItems) => {
  return cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
};

// Read and sanitize cart id from request headers.
const getCartIdFromRequest = (req) => {
  const rawCartId = req.headers["x-cart-id"];
  if (!rawCartId || typeof rawCartId !== "string" || !rawCartId.trim()) {
    return null;
  }
  return rawCartId.trim();
};

// Load existing cart by cartId or create a new empty one.
const getOrCreateCart = async (cartId) => {
  let cart = await Cart.findOne({ cartId });
  if (!cart) {
    cart = await Cart.create({
      cartId,
      cartItems: [],
      total: 0,
    });
  }
  return cart;
};

// POST /api/cart
export const ADD_TO_CART = async (req, res) => {
  try {
    // Read payload fields.
    const { productId, quantity = 1 } = req.body;
    // Identify cart from request header.
    const cartId = getCartIdFromRequest(req);

    // Enforce cart-id header.
    if (!cartId) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "x-cart-id header is required",
      });
    }

    // Enforce required product id.
    if (!productId) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "productId is required",
      });
    }

    // Validate positive integer quantity.
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "quantity must be a positive integer",
      });
    }

    // Ensure product exists before adding snapshot to cart.
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        data: null,
        status: "fail",
        message: "Product not found",
      });
    }

    // Resolve cart by cartId.
    const cart = await getOrCreateCart(cartId);

    // Find index if product already exists in cart.
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    // Increment existing line quantity or push new line snapshot.
    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += parsedQuantity;
    } else {
      cart.cartItems.push({
        product: productId,
        name: product.name,
        imageUrl: product.imageUrl,
        price: Number(product.price),
        quantity: parsedQuantity,
      });
    }

    // Recalculate cart total after mutation.
    cart.total = getCartTotal(cart.cartItems);

    // Persist cart changes.
    await cart.save();

    // Return updated cart payload.
    return res.status(200).json({
      status: "success",
      data: cart,
      message: "Product added to cart",
    });
  } catch (error) {
    // Return generic server error.
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};

// GET /api/cart
export const GET_USER_CART = async (req, res) => {
  try {
    // Resolve cart id from headers.
    const cartId = getCartIdFromRequest(req);
    if (!cartId) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "x-cart-id header is required",
      });
    }

    // Fetch cart and populate product references.
    const cart = await Cart.findOne({ cartId }).populate("cartItems.product");

    // Return empty cart shape if no cart exists yet.
    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart empty",
      });
    }

    // Return cart data.
    return res.status(200).json({
      status: "success",
      data: cart,
      message: "Cart found",
    });
  } catch (error) {
    // Return server error.
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};

// DELETE /api/cart/clear
export const CLEAR_CART = async (req, res) => {
  try {
    // Resolve cart id from headers.
    const cartId = getCartIdFromRequest(req);
    if (!cartId) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "x-cart-id header is required",
      });
    }

    // Find cart for current cart id.
    const cart = await Cart.findOne({ cartId });

    // If no cart, return already-empty shape.
    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart already empty",
      });
    }

    // Clear items and reset total.
    cart.cartItems = [];
    cart.total = 0;
    await cart.save();

    // Return empty cart response.
    return res.status(200).json({
      status: "success",
      data: { cartItems: [], total: 0 },
      message: "Cart cleared",
    });
  } catch (error) {
    // Return server error.
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};

// DELETE /api/cart/:productId
export const REMOVE_CART_ITEM = async (req, res) => {
  try {
    // Read target product id from route.
    const { productId } = req.params;
    // Resolve cart id from headers.
    const cartId = getCartIdFromRequest(req);
    if (!cartId) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "x-cart-id header is required",
      });
    }

    // Find cart for current cart id.
    const cart = await Cart.findOne({ cartId });

    // Return empty cart shape when cart does not exist.
    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart empty",
      });
    }

    // Keep length to detect whether item existed.
    const initialLength = cart.cartItems.length;
    // Remove the matching line item.
    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== productId
    );

    // If nothing removed, return not-found response.
    if (cart.cartItems.length === initialLength) {
      return res.status(404).json({
        status: "fail",
        data: cart,
        message: "Item not found in cart",
      });
    }

    // Recompute total and save.
    cart.total = getCartTotal(cart.cartItems);
    await cart.save();

    // Return updated cart.
    return res.status(200).json({
      status: "success",
      data: cart,
      message: "Product removed from cart",
    });
  } catch (error) {
    // Return server error.
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};

// PUT /api/cart
export const UPDATE_CART_ITEM = async (req, res) => {
  try {
    // Read payload for target item + quantity.
    const { productId, quantity } = req.body;
    // Resolve cart id from headers.
    const cartId = getCartIdFromRequest(req);
    if (!cartId) {
      return res.status(400).json({
        data: null,
        status: "fail",
        message: "x-cart-id header is required",
      });
    }

    // Find cart for current cart id.
    const cart = await Cart.findOne({ cartId });

    // Ensure productId is provided.
    if (!productId) {
      return res.status(400).json({
        status: "fail",
        data: null,
        message: "productId is required",
      });
    }

    // Validate non-negative integer quantity.
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        status: "fail",
        data: null,
        message: "quantity must be a non-negative integer",
      });
    }

    // Return empty cart shape when cart does not exist.
    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: { cartItems: [], total: 0 },
        message: "Cart empty",
      });
    }

    // Find cart line by product id.
    const item = cart.cartItems.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    // Return 404 when line item is missing.
    if (!item) {
      return res.status(404).json({
        status: "fail",
        data: cart,
        message: "Item not found",
      });
    }

    // Quantity 0 means remove line; otherwise set new quantity.
    if (parsedQuantity === 0) {
      cart.cartItems = cart.cartItems.filter(
        (cartItem) => cartItem.product.toString() !== productId
      );
    } else {
      item.quantity = parsedQuantity;
    }

    // Recompute total and persist changes.
    cart.total = getCartTotal(cart.cartItems);
    await cart.save();

    // Return updated cart.
    return res.status(200).json({
      status: "success",
      data: cart,
      message: "Cart updated",
    });
  } catch (error) {
    // Return server error.
    return res.status(500).json({
      message: error.message,
      status: "fail",
      data: null,
    });
  }
};
