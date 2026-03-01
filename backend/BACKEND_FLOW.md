# Backend Flow Explanation

This document explains how requests move through the backend and what each server, route, controller, and model does.

## 1) Server Boot Flow (`server.js`)
1. Environment variables are loaded using `dotenv`.
2. MongoDB connection is initialized with `connectDB()` from `config/db.js`.
3. Express app is created and middleware is attached:
   - `cors()` for cross-origin requests.
   - `express.json()` for JSON body parsing.
   - `morgan("dev")` for request logging.
4. Route groups are mounted:
   - `/api/products` -> product routes (public)
   - `/api/cart` -> cart routes (protected with `protect`)
   - `/api/orders` -> order routes (protected with `protect`)
   - `/api/users` -> user routes (mixed public/protected)
5. Server starts on `process.env.PORT || 3000`.

## 2) Database Connection (`config/db.js`)
- Uses `mongoose.connect(process.env.MONGO_URI)`.
- On success, prints DB host.
- On failure, logs error and exits process.

## 3) Auth Flow

### JWT Generation (`utils/generateToken.js`)
- `generateToken(id)` signs `{ id }` with `JWT_SECRET`.
- Token expiry: `30d`.

### Auth Middleware (`middlewares/authMiddleware.js`)
1. Reads `Authorization` header.
2. Expects `Bearer <token>`.
3. Verifies token with `JWT_SECRET`.
4. Loads user by decoded id and attaches to `req.user` (without password).
5. Calls `next()` for valid tokens.
6. Returns `401` for invalid/missing token.

## 4) Route -> Controller Mapping

## Product (`routes/productRoutes.js`)
- `GET /api/products` -> `GET_PRODUCTS`
- `POST /api/products` -> `ADD_PRODUCT`
- `GET /api/products/:id` -> `GET_SINGLE_PRODUCT`
- `PUT /api/products/:id` -> `EDIT_PRODUCT`
- `DELETE /api/products/:id` -> `DELETE_PRODUCT`

## Cart (`routes/cartRoutes.js`) [Protected]
- `POST /api/cart` -> `ADD_TO_CART`
- `GET /api/cart` -> `GET_USER_CART`
- `PUT /api/cart` -> `UPDATE_CART_ITEM`
- `DELETE /api/cart/clear` -> `CLEAR_CART`
- `DELETE /api/cart/:productId` -> `REMOVE_CART_ITEM`

## User (`routes/userRoutes.js`)
- `POST /api/users/register` -> `REGISTER`
- `POST /api/users/login` -> `LOGIN`
- `GET /api/users/profile` -> `GET_USER_PROFILE` (protected)
- `PUT /api/users/profile` -> `UPDATE_USER_PROFILE` (protected)
- `DELETE /api/users/:id` -> `DELETE_USER` (protected)

## Order (`routes/orderRoutes.js`) [Protected]
- `POST /api/orders` -> `CREATE_ORDER`
- `GET /api/orders` -> `GET_USER_ORDERS`

## 5) Controller Responsibilities

## Product Controller (`controllers/productController.js`)
- `GET_PRODUCTS`: Fetches all products.
- `ADD_PRODUCT`: Validates required fields and creates a product.
- `GET_SINGLE_PRODUCT`: Finds one product by id.
- `DELETE_PRODUCT`: Checks product existence and deletes it.
- `EDIT_PRODUCT`: Updates product fields partially and saves.

## Cart Controller (`controllers/cartController.js`)
- `ADD_TO_CART`:
  - Validates product exists.
  - Finds or creates user cart.
  - Increments quantity if item exists; otherwise pushes new item snapshot.
  - Recalculates `total`.
- `GET_USER_CART`:
  - Returns user cart if found.
  - Returns empty cart shape if not found.
- `UPDATE_CART_ITEM`:
  - Finds cart and item by `productId`.
  - Updates quantity and recalculates total.
- `REMOVE_CART_ITEM`:
  - Removes item by product id and recalculates total.
- `CLEAR_CART`:
  - Empties all cart items and resets total.

## User Controller (`controllers/userController.js`)
- `REGISTER`:
  - Checks duplicate email.
  - Creates user.
  - Returns user info + JWT token.
- `LOGIN`:
  - Finds user by email.
  - Validates password via `matchPassword`.
  - Returns user info + JWT token.
- `GET_USER_PROFILE`:
  - Returns authenticated user's profile (without password).
- `UPDATE_USER_PROFILE`:
  - Updates authenticated user's name/email/password.
  - Returns updated user data + new token.
- `DELETE_USER`:
  - Deletes user by id.

## Order Controller (`controllers/orderController.js`)
- `CREATE_ORDER`:
  - Validates `shippingAddress` and `paymentMethod`.
  - Loads current user cart.
  - If cart has items, creates order using cart snapshot.
  - Clears cart after successful order creation.
- `GET_USER_ORDERS`:
  - Returns all logged-in user's orders.
  - Populates `orderItems.product`.
  - Sorts newest first.

## 6) Model Design

## Product Model (`models/product.js`)
- Fields: `name`, `price`, `description`, `imageUrl`.
- Constraints:
  - `name` unique, required, min length 5.
  - `price` stored as string.
  - `description` min length 20.

## User Model (`models/user.js`)
- Fields: `name`, `email`, `password`, `role`.
- `role` enum: `user | admin`.
- `matchPassword` method compares plaintext vs hash.
- Includes pre-save password hashing hook.

## Cart Model (`models/cart.js`)
- One cart per user (`user` unique).
- `cartItems[]` includes:
  - `product` ref
  - item snapshot fields (`name`, `imageUrl`, `price`, `quantity`)
- `total` stores cart amount.

## Order Model (`models/order.js`)
- Linked to `user`.
- `orderItems[]` stores copied cart item snapshot.
- `shippingAddress` object.
- `total`, `paymentMethod`, `paymentStatus`, `status`.
- Timestamps enabled.

## 7) End-to-End Lifecycle
1. User registers or logs in and gets JWT token.
2. User fetches products.
3. User adds products to cart (`/api/cart` with token).
4. User can update/remove/clear cart.
5. User creates order (`/api/orders`) with shipping + payment method.
6. Backend copies cart items to order, sets statuses to pending, clears cart.
7. User fetches order history from `/api/orders`.

## 8) Notes for Current Implementation
- Cart and order routes are protected at mount level in `server.js`.
- User `profile` routes are additionally protected at route level.
- Error handling is inline inside each controller.
- Some response status codes/messages are not fully REST-consistent (for example, fetch endpoints returning `201` in product controller).

