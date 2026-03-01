# Frontend Requirements Status

This document reflects the current frontend implementation against the backend APIs.

## Completed

### Authentication (User)
- Register form is integrated with `POST /api/users/register`.
- Login form is integrated with `POST /api/users/login`.
- JWT + user are persisted in local storage via auth context.
- Logout clears auth state and token.
- Profile page is integrated with:
  - `GET /api/users/profile`
  - `PUT /api/users/profile`
- Navbar shows auth-aware links (Login/Register vs Profile/Logout).

### Cart
- Cart context is implemented and wired to protected endpoints:
  - `GET /api/cart`
  - `POST /api/cart`
  - `PUT /api/cart`
  - `DELETE /api/cart/:productId`
  - `DELETE /api/cart/clear`
- Add-to-cart is wired in both:
  - Product cards
  - Product detail page
- Cart page supports list, quantity updates, remove, clear, total, and checkout navigation.
- Navbar includes cart item count.

### Orders
- Checkout page posts order creation to `POST /api/orders`.
- Orders page fetches order history from `GET /api/orders`.
- Order cancel is wired to `PUT /api/orders/:orderId/cancel`.
- Order creation success is surfaced in orders page.

### Route Protection
- Protected route wrapper is implemented.
- Logged-in protection added for cart, checkout, orders, profile.
- Admin-only protection added for:
  - Add product
  - Admin dashboard
  - Manage products
  - Edit product

### API Integration
- Frontend now uses shared API client with configurable base URL:
  - `VITE_API_BASE_URL` (fallback: `http://localhost:3000`)
- Protected requests include `Authorization: Bearer <token>`.

### CSS Constraint
- Existing CSS files were preserved (no style-system rewrite).

## Partially Completed / Backend-Limited

### Admin Orders Management
- User-specific order management is implemented.
- "Get all orders" admin view is not implemented because backend currently exposes only `GET /api/orders` for the authenticated user's orders.
- Admin status update route exists (`PUT /api/orders/:orderId/status`) but there is no backend endpoint to list all orders for admins.

### Admin Users Management
- Frontend admin users table is not implemented because backend currently has no "list all users" endpoint.
- `DELETE /api/users/:id` exists and can be integrated into admin users UI once listing is available.

## Notes
- Product CRUD integration remains functional and now uses shared API utility.
- Build succeeds with current code.
