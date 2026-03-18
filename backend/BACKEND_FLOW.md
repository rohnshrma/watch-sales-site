# Backend Flow Explanation

This document describes the backend flow for the `cart_user_order_payments` branch, including the cart pipeline, order lifecycle, and Stripe test payment integration.

## 1) Server Boot Flow (`server.js`)

1. `dotenv` loads environment variables.
2. `connectDB()` connects Mongoose to `MONGO_URI`.
3. Express middleware is registered:
   - `cors()`
   - `express.json()`
   - `morgan("dev")`
4. Route groups are mounted:
   - `/api/products` -> public product routes
   - `/api/cart` -> protected cart routes
   - `/api/orders` -> protected order + payment routes
   - `/api/users` -> mixed auth/profile routes
5. Server listens on `process.env.PORT || 3000`.

## 2) Environment Variables

Current backend behavior depends on these values:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_CURRENCY` (optional, defaults to `inr`)

If `STRIPE_SECRET_KEY` is missing, Stripe payment-intent creation and Stripe-backed order creation will fail with a configuration error.

## 3) Authentication Flow

### Token Utility (`utils/generateToken.js`)

- Signs `{ id }` with `JWT_SECRET`
- Token expiry: `30d`

### Auth Middleware (`middlewares/authMiddleware.js`)

1. Reads `Authorization` header.
2. Expects `Bearer <token>`.
3. Verifies token.
4. Loads the user from MongoDB.
5. Attaches the user to `req.user`.
6. Rejects invalid or missing tokens with `401`.

### Admin Gate

- `isAdmin` checks `req.user.role === "admin"`
- Rejects non-admin requests with `403`

## 4) Route Map

### Product Routes (`routes/productRoutes.js`)

- `GET /api/products` -> `GET_PRODUCTS`
- `POST /api/products` -> `ADD_PRODUCT`
- `GET /api/products/:id` -> `GET_SINGLE_PRODUCT`
- `PUT /api/products/:id` -> `EDIT_PRODUCT`
- `DELETE /api/products/:id` -> `DELETE_PRODUCT`

### Cart Routes (`routes/cartRoutes.js`) [Protected]

- `POST /api/cart` -> `ADD_TO_CART`
- `GET /api/cart` -> `GET_USER_CART`
- `PUT /api/cart` -> `UPDATE_CART_ITEM`
- `DELETE /api/cart/clear` -> `CLEAR_CART`
- `DELETE /api/cart/:productId` -> `REMOVE_CART_ITEM`

### User Routes (`routes/userRoutes.js`)

- `POST /api/users/register` -> `REGISTER`
- `POST /api/users/login` -> `LOGIN`
- `GET /api/users/profile` -> `GET_USER_PROFILE`
- `PUT /api/users/profile` -> `UPDATE_USER_PROFILE`
- `DELETE /api/users/:id` -> `DELETE_USER`

### Order + Payment Routes (`routes/orderRoutes.js`) [Protected]

- `POST /api/orders/payment-intent` -> `CREATE_STRIPE_PAYMENT_INTENT`
- `POST /api/orders` -> `CREATE_ORDER`
- `GET /api/orders` -> `GET_USER_ORDERS`
- `GET /api/orders/:orderId` -> `GET_ORDER_BY_ID`
- `PUT /api/orders/:orderId/cancel` -> `CANCEL_ORDER`
- `PUT /api/orders/:orderId/status` -> `UPDATE_ORDER_STATUS` (admin only)

## 5) Cart Flow

### `ADD_TO_CART`

1. Validates `productId`.
2. Validates `quantity` as a positive integer.
3. Loads the product snapshot from MongoDB.
4. Finds or creates the current user's cart.
5. If item already exists, increments quantity.
6. Otherwise pushes a cart snapshot item containing `product`, `name`, `imageUrl`, `price`, and `quantity`.
7. Recomputes `cart.total`.
8. Saves and returns the updated cart.

### `GET_USER_CART`

- Returns the populated cart if it exists.
- Returns `{ cartItems: [], total: 0 }` if it does not.

### `UPDATE_CART_ITEM`

1. Validates `productId`.
2. Validates `quantity` as a non-negative integer.
3. Finds the cart item.
4. Removes the item if `quantity === 0`, otherwise updates its quantity.
5. Recomputes `total`.

### `REMOVE_CART_ITEM`

- Removes one cart item by `productId`
- Recomputes `total`

### `CLEAR_CART`

- Empties `cartItems`
- Resets `total` to `0`

## 6) Stripe Utility Flow (`utils/stripe.js`)

- `getStripeClient()` lazily creates and reuses a Stripe SDK client
- Throws immediately if `STRIPE_SECRET_KEY` is missing
- `getStripeCurrency()` returns `STRIPE_CURRENCY` or `inr`

This keeps Stripe configuration in one place and prevents controller code from creating multiple clients.

## 7) Order and Payment Flow

### A. Create Stripe Payment Intent (`CREATE_STRIPE_PAYMENT_INTENT`)

Request:

- Requires authenticated user
- Requires complete `shippingAddress`
- Uses the current cart

Flow:

1. Validates shipping address fields.
2. Loads the cart for the current user.
3. Rejects empty carts.
4. Creates a Stripe PaymentIntent with:
   - `amount = cart.total * 100`
   - `currency = STRIPE_CURRENCY || "inr"`
   - `payment_method_types = ["card"]`
   - metadata containing user id, cart total, and item count
5. Returns:
   - `paymentIntentId`
   - `clientSecret`
   - `amount`
   - `currency`

This endpoint does not create an order yet. It only prepares the Stripe test payment.

### B. Create Order (`CREATE_ORDER`)

Request body:

- `shippingAddress`
- `paymentMethod`
- optional `paymentIntentId`

Shared flow:

1. Validates shipping address.
2. Loads the current cart.
3. Rejects empty carts.
4. Builds an order payload from the cart snapshot.

#### If `paymentMethod !== "stripe"`

- Creates the order directly
- Sets:
  - `status = "pending"`
  - `paymentStatus = "pending"`

#### If `paymentMethod === "stripe"`

Additional verification happens before the order is written:

1. Requires `paymentIntentId`.
2. Rejects duplicate order creation for the same payment intent.
3. Retrieves the PaymentIntent from Stripe.
4. Verifies the PaymentIntent belongs to the current user using metadata.
5. Verifies `paymentIntent.status === "succeeded"`.
6. Verifies the Stripe amount exactly matches the current cart total.
7. Creates the order with:
   - `status = "confirmed"`
   - `paymentStatus = "completed"`
   - `paymentIntentId`
   - `paidAt`
   - `paymentResult` snapshot

After successful order creation, the cart is cleared.

### C. Get User Orders (`GET_USER_ORDERS`)

- Fetches orders for the logged-in user only
- Populates `orderItems.product`
- Sorts newest first

### D. Get Order by Id (`GET_ORDER_BY_ID`)

1. Loads the order
2. Populates owner + product data
3. Allows access only to:
   - the order owner
   - an admin

### E. Cancel Order (`CANCEL_ORDER`)

- Owner or admin can cancel
- Rejected once status is:
  - `shipped`
  - `delivered`
  - `cancelled`

### F. Admin Order Updates (`UPDATE_ORDER_STATUS`)

Admin can update:

- `status`
- `paymentStatus`

Both values are validated against allowed enums before save.

## 8) Data Model Summary

### Product (`models/product.js`)

- `name`
- `price`
- `description`
- `imageUrl`
- timestamps

### User (`models/user.js`)

- `name`
- `email`
- `password`
- `role`

Includes password hashing and `matchPassword`.

### Cart (`models/cart.js`)

- one cart per user
- `cartItems[]` snapshot structure:
  - `product`
  - `name`
  - `imageUrl`
  - `price`
  - `quantity`
- `total`

### Order (`models/order.js`)

- `user`
- `orderItems[]`
- `shippingAddress`
- `total`
- `status`
- `paymentMethod`
- `paymentStatus`
- `paymentIntentId`
- `paidAt`
- `paymentResult`
- timestamps

`paymentResult` stores a saved Stripe summary:

- Stripe id
- Stripe status
- currency
- amount
- payment method types

## 9) End-to-End Checkout Lifecycle

1. User logs in and gets a JWT.
2. User adds products to cart.
3. Frontend collects shipping details on checkout.
4. Frontend calls `POST /api/orders/payment-intent`.
5. Backend creates a Stripe PaymentIntent for the current cart total.
6. Frontend confirms the payment using Stripe test card details.
7. Frontend calls `POST /api/orders` with `paymentMethod: "stripe"` and the successful `paymentIntentId`.
8. Backend verifies the Stripe payment intent and creates the order.
9. Backend clears the cart.
10. User sees the order in `/api/orders` history with completed payment metadata.

## 10) Important Current Notes

- Order creation is protected from fake client-side success because the backend re-checks Stripe before creating a Stripe-backed order.
- Cart snapshots are copied into orders so later product edits do not break historical orders.
- Cancelling an order does not perform Stripe refunds in this branch.
- Error handling remains inline in controllers rather than using centralized middleware.
