# Backend Flow Explanation (User + Cart Scope)

This document explains request flow in `user_and_cart`.

## 1) Server Boot Flow (`server.js`)
1. Load env vars via `dotenv`.
2. Connect DB via `connectDB()`.
3. Create Express app.
4. Attach middleware: `cors`, `express.json`, `morgan("dev")`.
5. Mount routes:
   - `/api/products` -> product routes (public)
   - `/api/cart` -> cart routes (protected)
   - `/api/users` -> user routes (mixed public/protected)
6. Start server on `PORT` or `3000`.

## 2) Auth Flow
- `POST /api/users/register` creates account and returns bearer token.
- `POST /api/users/login` validates credentials and returns bearer token.
- `protect` middleware validates bearer token and attaches `req.user`.
- `GET/PUT /api/users/profile` use `req.user`.

## 3) Cart Flow (Auth-Connected)
- Cart routes require valid bearer token.
- Cart is looked up using `req.user.id`.
- First add creates a cart document for that user.
- Update/remove/clear mutate the same user-owned cart.

## 4) Route -> Controller Mapping

### Product
- `GET /api/products` -> `GET_PRODUCTS`
- `POST /api/products` -> `ADD_PRODUCT`
- `GET /api/products/:id` -> `GET_SINGLE_PRODUCT`
- `PUT /api/products/:id` -> `EDIT_PRODUCT`
- `DELETE /api/products/:id` -> `DELETE_PRODUCT`

### Users
- `POST /api/users/register` -> `REGISTER`
- `POST /api/users/login` -> `LOGIN`
- `GET /api/users/profile` -> `GET_USER_PROFILE` (protected)
- `PUT /api/users/profile` -> `UPDATE_USER_PROFILE` (protected)

### Cart
- `POST /api/cart` -> `ADD_TO_CART` (protected)
- `GET /api/cart` -> `GET_USER_CART` (protected)
- `PUT /api/cart` -> `UPDATE_CART_ITEM` (protected)
- `DELETE /api/cart/clear` -> `CLEAR_CART` (protected)
- `DELETE /api/cart/:productId` -> `REMOVE_CART_ITEM` (protected)

## 5) Model Summary
- `Product`: catalog data.
- `User`: account identity + password hash + role.
- `Cart`: one document per user with cart items and total.

## 6) Out of Scope
- Order creation/history
- Payment handling
