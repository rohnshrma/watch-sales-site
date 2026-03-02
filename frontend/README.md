# Watch Sales Frontend (Cart Brand Scope)

Frontend for the cart-brand version of the watch store.

Current frontend scope is intentionally limited to:
- Product browsing and product management
- Cart management

Removed from scope:
- User login/register/profile
- Auth guards/roles
- Checkout/orders/payment

## Tech Stack
- React 19
- Vite
- React Router DOM
- Context API + `useReducer`
- Axios

## Project Structure
```txt
src/
  main.jsx
  App.jsx
  Components/
    Nav.jsx
    ProductCard.jsx
  Pages/
    Home.jsx
    ProductPage.jsx
    Cart.jsx
    AddProduct.jsx
    Admin/
      ManageProducts.jsx
      EditProduct.jsx
  context/
    ProductContext.jsx
    CartContext.jsx
  utils/
    api.js
```

## App Boot Flow
`src/main.jsx` wraps `App` in:
1. `StrictMode`
2. `BrowserRouter`
3. `ProductProvider`
4. `CartProvider`

## Routing (`App.jsx`)
- `/` -> `Home`
- `/product/:id` -> `ProductPage`
- `/cart` -> `Cart`
- `/add-product` -> `AddProduct`
- `/manage-products` -> `ManageProducts`
- `/edit-product/:id` -> `EditProduct`

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

Cart (`x-cart-id` header required):
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart`
- `DELETE /api/cart/:productId`
- `DELETE /api/cart/clear`

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
- Cart identity is generated in frontend and persisted locally.
- Detailed behavior is documented in `FRONTEND_FLOW.md`.
