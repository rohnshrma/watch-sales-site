# Frontend Flow Documentation (Cart Brand Scope)

This document describes the current frontend flow after restricting the project to products + cart only.

## 1) Entry Point: `src/main.jsx`
`main.jsx` bootstraps React and wraps the app in providers.

Provider order:
1. `StrictMode`
2. `BrowserRouter`
3. `ProductProvider`
4. `CartProvider`
5. `App`

## 2) Root Routing: `src/App.jsx`
`App.jsx` always renders `Nav` and maps routes.

Active routes:
- `/` -> `Home`
- `/product/:id` -> `ProductPage`
- `/cart` -> `Cart`
- `/add-product` -> `AddProduct`
- `/manage-products` -> `ManageProducts`
- `/edit-product/:id` -> `EditProduct`

## 3) API Layer: `src/utils/api.js`
Shared Axios client:
- `baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"`

## 4) Product Flow: `src/context/ProductContext.jsx`
State:
- `products`
- `product`

API methods:
- `fetchProducts()` -> `GET /api/products`
- `fetchProduct(id)` -> `GET /api/products/:id`
- `addNewProduct(product)` -> `POST /api/products`
- `editProduct(id, payload)` -> `PUT /api/products/:id`
- `deleteProduct(id)` -> `DELETE /api/products/:id`

## 5) Cart Flow: `src/context/CartContext.jsx`
State:
- `cartItems`
- `total`
- `loading`

Cart identity:
- Frontend creates/persists a local cart id in localStorage.
- Every cart request sends header: `x-cart-id`.

API methods:
- `fetchCart()` -> `GET /api/cart`
- `addProductToCart(productOrId, quantity)` -> `POST /api/cart`
- `updateCartItem(productId, quantity)` -> `PUT /api/cart`
- `removeCartItem(productId)` -> `DELETE /api/cart/:productId`
- `clearCart()` -> `DELETE /api/cart/clear`

## 6) Key Page Flows
### `Home.jsx`
- Fetches products on mount.
- Supports search + sorting.
- Renders product grid.

### `ProductPage.jsx`
- Loads product by route param `id`.
- Adds selected product to cart.

### `Cart.jsx`
- Loads cart from context.
- Supports quantity update, remove item, clear cart.
- Shows cart totals.

### Product Management Pages
- `AddProduct.jsx` -> create product form.
- `ManageProducts.jsx` -> list with edit/delete actions.
- `EditProduct.jsx` -> update existing product.

## 7) Navbar: `src/Components/Nav.jsx`
- Home
- Manage Products
- Add Product
- Cart count

## 8) Out of Scope (Removed)
- Login/Register/Profile
- Protected routes
- Checkout/Orders/Payment
