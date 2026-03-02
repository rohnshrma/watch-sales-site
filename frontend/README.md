# Watch Sales Frontend (User + Cart Scope)

Frontend for the `user_and_cart` branch.

Current scope:
- Product browsing + product management
- User auth (register/login/profile/logout)
- Auth-protected cart connected to backend user cart

Out of scope:
- Checkout
- Orders
- Payment

## Tech Stack
- React 19
- Vite
- React Router DOM
- Context API + hooks
- Axios

## Active Pages
- `/` Home
- `/product/:id` Product details
- `/user/register` Register
- `/user/login` Login
- `/profile` Profile (protected)
- `/cart` Cart (protected)
- `/add-product` Add product
- `/manage-products` Manage products
- `/edit-product/:id` Edit product

## Contexts
- `AuthContext` for auth session + profile
- `ProductContext` for product CRUD state/actions
- `CartContext` for protected cart state/actions

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
- `GET /api/users/profile`
- `PUT /api/users/profile`

Cart (Bearer token):
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart`
- `DELETE /api/cart/:productId`
- `DELETE /api/cart/clear`

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
