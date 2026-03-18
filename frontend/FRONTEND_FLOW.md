# Frontend Flow Documentation

This document explains the frontend flow for the `cart_user_order_payments` branch, including auth persistence, cart handling, and the Stripe test checkout flow.

## 1) App Boot Flow

Entry path:

`index.html` -> `src/main.jsx` -> providers -> `src/App.jsx`

Provider order in `src/main.jsx`:

1. `StrictMode`
2. `BrowserRouter`
3. `AuthProvider`
4. `ProductProvider`
5. `CartProvider`
6. `OrderProvider`

This means auth state is available before cart and order contexts run.

## 2) Router Layout (`src/App.jsx`)

`App.jsx` always renders the navbar and then switches pages using React Router.

### Public Routes

- `/` -> `Home`
- `/product/:id` -> `ProductPage`
- `/user/register` -> `Register`
- `/user/login` -> `Login`

### Protected User Routes

- `/cart` -> `Cart`
- `/checkout` -> `Checkout`
- `/orders` -> `Orders`
- `/profile` -> `Profile`

### Protected Admin Routes

- `/add-product`
- `/admin/dashboard`
- `/admin/manage-products`
- `/admin/edit-product/:id`

Protection is enforced by `src/Components/ProtectedRoute.jsx`.

## 3) Shared API Client (`src/utils/api.js`)

All contexts use one Axios instance.

- `baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"`

This keeps requests consistent across auth, cart, product, and order flows.

## 4) Auth Flow (`src/context/AuthContext.jsx`)

### State

- `user`
- `token`
- `isLoading`

### Persistence

- Saved in localStorage under `watchStoreAuth`
- Restored on app load

### Exposed Actions

- `register(payload)`
- `login(payload)`
- `logout()`
- `fetchProfile()`
- `updateProfile(payload)`

### Derived Values

- `isAuthenticated`
- `isAdmin`
- `authHeaders`

`authHeaders` is reused by cart and order contexts for protected requests.

## 5) Product Flow (`src/context/ProductContext.jsx`)

The product context handles:

- list fetching
- single product fetching
- admin add/edit/delete operations

Used by:

- `Home`
- `ProductPage`
- admin product pages

## 6) Cart Flow (`src/context/CartContext.jsx`)

### State

- `cartItems`
- `total`
- `loading`

### Backend Calls

- `fetchCart()` -> `GET /api/cart`
- `addProductToCart(productId, quantity)` -> `POST /api/cart`
- `updateCartItem(productId, quantity)` -> `PUT /api/cart`
- `removeCartItem(productId)` -> `DELETE /api/cart/:productId`
- `clearCart()` -> `DELETE /api/cart/clear`

### Sync Behavior

1. When a user becomes authenticated, `fetchCart()` runs.
2. When auth disappears, cart state resets to an empty cart.
3. Every mutation writes the latest server cart back into context state.

## 7) Order Flow (`src/context/OrderContext.jsx`)

### State

- `orders`
- `loading`

### Backend Calls

- `fetchOrders()` -> `GET /api/orders`
- `createPaymentIntent(payload)` -> `POST /api/orders/payment-intent`
- `createOrder(payload)` -> `POST /api/orders`
- `cancelOrder(orderId)` -> `PUT /api/orders/:orderId/cancel`

This context is the bridge between checkout UI and the protected backend order/payment pipeline.

## 8) Checkout Flow (`src/Pages/Checkout.jsx`)

The checkout page is now a Stripe test checkout instead of a direct order form.

### Stripe Setup

- Reads `VITE_STRIPE_PUBLISHABLE_KEY`
- Builds `stripePromise` using `loadStripe(...)`
- Wraps the form in `<Elements>`

If the publishable key is missing, the page shows a warning instead of a broken payment form.

### Form Data

- `street`
- `city`
- `state`
- `zipCode`
- `country`
- fixed `paymentMethod = "stripe"`

### Submit Flow

1. Prevents submit if the cart is empty.
2. Prevents submit if Stripe has not loaded.
3. Sends shipping data to `createPaymentIntent(...)`.
4. Receives:
   - `clientSecret`
   - `paymentIntentId`
   - amount
   - currency
5. Uses `stripe.confirmCardPayment(...)` with:
   - `CardElement`
   - billing name/email from auth state
   - billing address from the checkout form
6. If Stripe confirms successfully, calls `createOrder(...)` with:
   - `shippingAddress`
   - `paymentMethod: "stripe"`
   - `paymentIntentId`
7. Navigates to `/orders` after the order is written on the backend.

### Test Payment UX

The page tells the user to use Stripe test card:

- `4242 4242 4242 4242`

with any future expiry, any 3-digit CVC, and any postal code.

## 9) Orders Page (`src/Pages/Orders.jsx`)

### Load Flow

1. On mount, calls `fetchOrders()`
2. Handles backend errors locally
3. Shows loading, empty, or populated order states

### Displayed Order Data

- order id
- order status
- payment status
- payment method
- total
- created timestamp
- paid timestamp when available
- Stripe payment intent id when available
- order items

### Cancellation

- Calls `cancelOrder(orderId)`
- Refreshes order history after success
- Disables cancel when backend rules would reject it

## 10) Other Page Flows

### `Home.jsx`

- Fetches products on mount
- Renders the product grid

### `ProductPage.jsx`

- Loads a single product by route id
- Supports add-to-cart

### `Cart.jsx`

- Shows line items and totals
- Supports quantity updates, remove, clear cart
- Links the user into checkout

### `Register.jsx` and `Login.jsx`

- Submit credentials through auth context
- Persist login after success

### `Profile.jsx`

- Fetches and updates the authenticated user's profile

### Admin Pages

- `AddProduct.jsx`
- `AdminDashboard.jsx`
- `ManageProducts.jsx`
- `EditProduct.jsx`

These pages still focus on product management rather than order management.

## 11) Current Requirements and Notes

- `VITE_API_BASE_URL` should point at the backend server.
- `VITE_STRIPE_PUBLISHABLE_KEY` is required for the checkout page to run Stripe test payments.
- The frontend only treats a payment as complete after Stripe confirms it and the backend accepts the matching payment intent.
- Order history now surfaces payment metadata so the fake Stripe flow is visible after checkout.
