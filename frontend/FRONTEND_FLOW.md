# Frontend Flow Documentation

This document explains how this frontend works, especially `main.jsx`, `App.jsx`, and the component/page flow.

## 1) Entry Point: `src/main.jsx`

`main.jsx` is responsible for bootstrapping React and wrapping global providers.

Order of wrappers:

1. `StrictMode` for development checks.
2. `BrowserRouter` (aliased as `Router`) for route handling.
3. `ProductProvider` for product state and API actions.
4. `App` as the root UI component.

Flow:

`index.html` -> `main.jsx` -> providers -> `App.jsx`

## 2) Root App Layer: `src/App.jsx`

`App.jsx` defines global layout and route mapping.

What it does:

1. Always renders `Nav` at the top.
2. Uses `Routes` and `Route` from React Router.
3. Maps URL paths to page components.

Routes configured:

- `/` -> `Home`
- `/add-product` -> `AddProduct`
- `/product/:id` -> `ProductPage`
- `/admin/dashboard` -> `AdminDashboard`
- `/admin/manage-products` -> `ManageProducts`
- `/admin/edit-product/:id` -> `EditProduct`
- `/user/register` -> `Register`

## 3) Navigation Flow: `src/Components/Nav.jsx`

`Nav` provides primary links to:

- Home
- Add Product
- Admin Dashboard

Each link updates route state without a full page reload via React Router `Link`.

## 4) Data Layer Flow: `src/context/ProductContext.jsx`

`ProductContext` is the core state layer for products.

State managed:

- `products` (list view data)
- `product` (single product detail)

Reducer actions:

- `FETCH_PRODUCTS`: replace product list.
- `FETCH_PRODUCT`: set selected product.
- `ADD`: prepend newly created product in state.

API methods exposed by context:

- `fetchProducts()` -> `GET /api/products`
- `fetchProduct(id)` -> `GET /api/products/:id`
- `addNewProduct(product)` -> `POST /api/products`
- `editProduct(id, updatedProduct)` -> `PUT /api/products/:id`
- `deleteProduct(id)` -> `DELETE /api/products/:id`

All product pages and admin pages consume these methods through `useContext(ProductContext)`.

## 5) Page-Level Flow

### `Home.jsx`

1. On mount, calls `fetchProducts()`.
2. Shows loading spinner while waiting.
3. Renders product grid using `ProductCard`.
4. Empty-state UI if no products returned.

### `ProductPage.jsx`

1. Reads `id` from route params.
2. Calls `fetchProduct(id)` on mount/id change.
3. Displays selected product from context state.

### `AddProduct.jsx`

1. Uses local `useReducer` for form state.
2. Validates form input.
3. Calls `addNewProduct(product)` on submit.
4. Refetches product list for sync.
5. Shows success/error messages.

### `AdminDashboard.jsx`

Displays admin cards and navigates to Manage Products when products card is clicked.

### `ManageProducts.jsx`

1. Calls `fetchProducts()` on mount.
2. Displays products using `ProductCard` with `isAdmin={true}`.
3. Admin mode enables Delete and Edit actions.

### `EditProduct.jsx`

1. Reads `id` from route params.
2. Loads existing product from context list.
3. Pre-fills local form reducer state.
4. Validates and sends update through `editProduct(id, product)`.
5. Refetches products after update.

### `Register.jsx`

Contains register form state handling via `useReducer`, but no backend submit integration yet.

## 6) Reusable Component Flow

### `ProductCard.jsx`

Input props:

- `product`
- `isAdmin` (optional)

Behavior:

- Clicking product image navigates to `/product/:id`.
- Normal mode: shows `Add to cart` button.
- Admin mode:
  - `Delete` triggers `deleteProduct(product._id)`.
  - `Edit` navigates to `/admin/edit-product/:id`.

## 7) Context and Routing Together

End-to-end request flow for listing products:

1. User visits `/`.
2. `App.jsx` renders `Home`.
3. `Home` calls `fetchProducts()` from `ProductContext`.
4. Context makes Axios call to backend.
5. Reducer stores product list.
6. `Home` re-renders and maps list to `ProductCard`.

Flow for editing a product:

1. User opens `/admin/manage-products`.
2. Clicks `Edit` on a `ProductCard`.
3. Router navigates to `/admin/edit-product/:id`.
4. `EditProduct` loads selected product data.
5. Submit calls context `editProduct`.
6. Backend updates record.
7. Frontend refetches and re-renders updated list.

## 8) Current Gaps / Notes

- `CartContext.jsx` is scaffolded but reducer logic is not implemented.
- `Register.jsx` does not call any API yet.
- Backend URL is hardcoded to `http://localhost:3000` in context methods.

