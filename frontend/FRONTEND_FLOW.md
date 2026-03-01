# Frontend Flow Documentation

This document describes the current frontend flow after backend integration updates.

## 1) Entry Point: `src/main.jsx`

`main.jsx` bootstraps React and wraps the app in providers.

Provider order:

1. `StrictMode`
2. `BrowserRouter`
3. `AuthProvider`
4. `ProductProvider`
5. `CartProvider`
6. `OrderProvider`
7. `App`

Flow: `index.html` -> `main.jsx` -> providers -> `App.jsx`

## 2) Root Routing: `src/App.jsx`

`App.jsx` always renders `Nav` and maps routes.

Public:

- `/` -> `Home`
- `/product/:id` -> `ProductPage`
- `/user/register` -> `Register`
- `/user/login` -> `Login`

Protected (authenticated):

- `/cart` -> `Cart`
- `/checkout` -> `Checkout`
- `/orders` -> `Orders`
- `/profile` -> `Profile`

Protected (admin):

- `/add-product` -> `AddProduct`
- `/admin/dashboard` -> `AdminDashboard`
- `/admin/manage-products` -> `ManageProducts`
- `/admin/edit-product/:id` -> `EditProduct`

Protection is enforced by `Components/ProtectedRoute.jsx`.

## 3) API Layer: `src/utils/api.js`

A shared Axios client is used across contexts.

- `baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"`

This removes hardcoded URLs from each context/page.

## 4) Auth Flow: `src/context/AuthContext.jsx`

State:

- `user`
- `token`
- `isLoading`

Capabilities:

- `register(payload)` -> `POST /api/users/register`
- `login(payload)` -> `POST /api/users/login`
- `logout()` -> clears state/localStorage
- `fetchProfile()` -> `GET /api/users/profile`
- `updateProfile(payload)` -> `PUT /api/users/profile`

Persistence:

- Stores auth payload in localStorage key `watchStoreAuth`.
- Exposes `authHeaders` with `Authorization: Bearer <token>`.

## 5) Product Flow: `src/context/ProductContext.jsx`

State:

- `products`
- `product`

Actions:

- `FETCH_PRODUCTS`
- `FETCH_PRODUCT`
- `ADD`

API methods:

- `fetchProducts()` -> `GET /api/products`
- `fetchProduct(id)` -> `GET /api/products/:id`
- `addNewProduct(product)` -> `POST /api/products`
- `editProduct(id, updatedProduct)` -> `PUT /api/products/:id`
- `deleteProduct(id)` -> `DELETE /api/products/:id`

Used by home/product/admin product pages.

## 6) Cart Flow: `src/context/CartContext.jsx`

State:

- `cartItems`
- `total`
- `loading`

Reducer actions:

- `SET_LOADING`
- `SET_CART`
- `RESET_CART`

API methods (protected):

- `fetchCart()` -> `GET /api/cart`
- `addProductToCart(productId, quantity)` -> `POST /api/cart`
- `updateCartItem(productId, quantity)` -> `PUT /api/cart`
- `removeCartItem(productId)` -> `DELETE /api/cart/:productId`
- `clearCart()` -> `DELETE /api/cart/clear`

Sync behavior:

- On login/auth availability, cart is fetched.
- On logout, cart state is reset.

## 7) Order Flow: `src/context/OrderContext.jsx`

State:

- `orders`
- `loading`

API methods (protected):

- `fetchOrders()` -> `GET /api/orders`
- `createOrder(payload)` -> `POST /api/orders`
- `cancelOrder(orderId)` -> `PUT /api/orders/:orderId/cancel`

## 8) Key Page Flows

### `Home.jsx`

1. Calls `fetchProducts()` on mount.
2. Renders loading, empty, or product grid state.

### `ProductPage.jsx`

1. Reads `id` from params.
2. Calls `fetchProduct(id)`.
3. Add-to-cart calls cart context; redirects to login if unauthenticated.

### `Register.jsx` / `Login.jsx`

- Submit auth payload to backend via `AuthContext`.
- Handle loading and backend errors.
- Redirect after successful auth.

### `Cart.jsx`

- Displays cart items and totals.
- Supports quantity update, remove, clear cart.
- Proceeds to `/checkout`.

### `Checkout.jsx`

- Collects full shipping address + payment method.
- Calls `createOrder()`.
- Redirects to `/orders` with created order info.

### `Orders.jsx`

- Loads order history on mount.
- Displays status, payment status, totals, and order items.
- Allows cancellation where backend rules permit.

### `Profile.jsx`

- Loads profile from context/backend.
- Updates name/email/password using protected profile endpoint.

### Admin Pages

- `AdminDashboard.jsx`: summary cards and navigation.
- `ManageProducts.jsx`: lists all products in admin mode.
- `EditProduct.jsx`: loads, edits, and updates product.
- `AddProduct.jsx`: validates and creates product.

## 9) Navbar Behavior: `src/Components/Nav.jsx`

Unauthenticated:

- Home
- Login
- Register

Authenticated:

- Home
- Cart (with item count)
- Orders
- Profile
- Logout

Admin additional links:

- Add Product
- Admin Dashboard

## 10) Current Backend-Limited Gaps

- Full admin orders management UI is limited by absence of a backend "list all orders" endpoint.
- Full admin users management UI is limited by absence of a backend "list all users" endpoint.
