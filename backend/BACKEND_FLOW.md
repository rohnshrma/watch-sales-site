# Backend Flow Explanation (Cart Brand Scope)

This document explains the current backend flow for the cart-brand scope.

## 1) Server Boot Flow (`server.js`)
1. Loads environment variables via `dotenv`.
2. Connects MongoDB with `connectDB()`.
3. Creates an Express app.
4. Attaches middleware:
   - `cors()` for cross-origin requests.
   - `express.json()` for JSON body parsing.
   - `morgan("dev")` for request logging.
5. Mounts route groups:
   - `/api/products` -> product routes
   - `/api/cart` -> cart routes
6. Starts server on `process.env.PORT || 3000`.

## 2) Database Connection (`config/db.js`)
- Uses `mongoose.connect(process.env.MONGO_URI)`.
- Logs connected DB host on success.
- Logs error and exits process on failure.

## 3) Route -> Controller Mapping

### Product (`routes/productRoutes.js`)
- `GET /api/products` -> `GET_PRODUCTS`
- `POST /api/products` -> `ADD_PRODUCT`
- `GET /api/products/:id` -> `GET_SINGLE_PRODUCT`
- `PUT /api/products/:id` -> `EDIT_PRODUCT`
- `DELETE /api/products/:id` -> `DELETE_PRODUCT`

### Cart (`routes/cartRoutes.js`)
- `POST /api/cart` -> `ADD_TO_CART`
- `GET /api/cart` -> `GET_USER_CART`
- `PUT /api/cart` -> `UPDATE_CART_ITEM`
- `DELETE /api/cart/clear` -> `CLEAR_CART`
- `DELETE /api/cart/:productId` -> `REMOVE_CART_ITEM`

## 4) Cart Identity Model (No Auth)
- Cart ownership is based on `x-cart-id` request header.
- Backend expects every cart request to include `x-cart-id`.
- Cart document stores `cartId` (string, unique).

## 5) Controller Responsibilities

### Product Controller (`controllers/productController.js`)
- `GET_PRODUCTS`: Fetches all products.
- `ADD_PRODUCT`: Validates required fields and creates a product.
- `GET_SINGLE_PRODUCT`: Finds one product by id.
- `DELETE_PRODUCT`: Checks product existence and deletes it.
- `EDIT_PRODUCT`: Updates product fields partially and saves.

### Cart Controller (`controllers/cartController.js`)
- `ADD_TO_CART`:
  - Validates `x-cart-id`, `productId`, and positive integer `quantity`.
  - Confirms product exists.
  - Loads or creates cart by `cartId`.
  - Increments quantity if item exists, else pushes a new snapshot item.
  - Recalculates total and saves.
- `GET_USER_CART`:
  - Validates `x-cart-id`.
  - Returns cart if found.
  - Returns empty cart shape if not found.
- `UPDATE_CART_ITEM`:
  - Validates `x-cart-id`, `productId`, and non-negative integer `quantity`.
  - Updates item quantity or removes item when quantity is `0`.
  - Recalculates total.
- `REMOVE_CART_ITEM`:
  - Validates `x-cart-id`.
  - Removes one item by `productId`.
  - Recalculates total.
- `CLEAR_CART`:
  - Validates `x-cart-id`.
  - Empties all items and resets total.

## 6) Model Design

### Product Model (`models/product.js`)
- Fields: `name`, `price`, `description`, `imageUrl`.
- Constraints:
  - `name` unique, required, min length 5.
  - `price` is number, minimum `0`.
  - `description` required, min length 20.
  - timestamps enabled.

### Cart Model (`models/cart.js`)
- One cart per `cartId` (unique string).
- `cartItems[]` includes:
  - `product` ref
  - `name`, `imageUrl`, `price`, `quantity` snapshot values
- `total` stores computed cart amount.

## 7) End-to-End Lifecycle
1. Client fetches products from `/api/products`.
2. Client creates/uses a persistent `x-cart-id`.
3. Client calls `/api/cart` endpoints with `x-cart-id`.
4. Backend stores and updates cart by `cartId`.

## 8) Out of Scope (Removed)
- User registration/login/profile
- JWT authentication
- Order creation/history/cancellation
- Payment methods/status
