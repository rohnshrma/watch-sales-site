# Watch Sales Frontend

Frontend for the Watch Store project, built with React + Vite.

## Tech Stack

- React 19
- Vite
- React Router DOM
- Context API + `useReducer`
- Axios
- Bootstrap 4

## Features Implemented

- Product listing, detail, create, edit, delete
- User register/login/logout with JWT persistence
- Profile fetch/update
- Cart integration (add, fetch, update quantity, remove, clear)
- Checkout and order creation
- Order history and order cancel (user scope)
- Route protection for authenticated and admin-only pages
- Role-aware navbar links

## Project Structure

```txt
src/
  main.jsx
  App.jsx
  Components/
    Nav.jsx
    ProductCard.jsx
    ProtectedRoute.jsx
  Pages/
    Home.jsx
    ProductPage.jsx
    AddProduct.jsx
    Register.jsx
    Login.jsx
    Cart.jsx
    Checkout.jsx
    Orders.jsx
    Profile.jsx
    Admin/
      AdminDashboard.jsx
      ManageProducts.jsx
      EditProduct.jsx
  context/
    AuthContext.jsx
    ProductContext.jsx
    CartContext.jsx
    OrderContext.jsx
  utils/
    api.js
```

## App Boot Flow

`src/main.jsx` wraps `App` in:

1. `StrictMode`
2. `BrowserRouter`
3. `AuthProvider`
4. `ProductProvider`
5. `CartProvider`
6. `OrderProvider`

## Routing (`App.jsx`)

Public routes:

- `/` -> `Home`
- `/product/:id` -> `ProductPage`
- `/user/register` -> `Register`
- `/user/login` -> `Login`

Protected user routes:

- `/cart` -> `Cart`
- `/checkout` -> `Checkout`
- `/orders` -> `Orders`
- `/profile` -> `Profile`

Protected admin routes:

- `/add-product` -> `AddProduct`
- `/admin/dashboard` -> `AdminDashboard`
- `/admin/manage-products` -> `ManageProducts`
- `/admin/edit-product/:id` -> `EditProduct`

## API Configuration

A shared Axios client is used from `src/utils/api.js`.

- Base URL: `VITE_API_BASE_URL`
- Fallback: `http://localhost:3000`

Set `.env` in `frontend/` if needed:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Backend Endpoints Used

Products:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Users:

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile` (Bearer token)
- `PUT /api/users/profile` (Bearer token)

Cart (Bearer token):

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart`
- `DELETE /api/cart/:productId`
- `DELETE /api/cart/clear`

Orders (Bearer token):

- `POST /api/orders`
- `GET /api/orders`
- `PUT /api/orders/:orderId/cancel`

## Run Locally

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Notes

- Existing CSS was preserved while updating frontend logic.
- Current admin order/user management is backend-limited by missing list endpoints.
- Detailed architecture is documented in `FRONTEND_FLOW.md`.
