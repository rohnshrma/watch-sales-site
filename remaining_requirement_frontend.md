# Deep Frontend Requirements (Wiring with Backend)

## 1. Authentication (User)

### Login Page/Component

- UI: Form with email & password fields, submit button, error display.
- Logic:
  - On submit, POST to `/api/users/login` with email & password.
  - On success: Save JWT token (localStorage or context), save user info (context).
  - Redirect to home or admin dashboard based on user role.
  - On error: Show error message.
- Integration: Add login link to navbar if not logged in.

### Register Page/Component

- UI: Form with name, email, password, submit button, error display.
- Logic:
  - On submit, POST to `/api/users/register`.
  - On success: Save JWT token, user info, redirect to home.
  - On error: Show error message.
- Integration: Add register link to navbar if not logged in.

### User Profile Page

- UI: Show name, email, editable fields, update button.
- Logic:
  - On mount, GET `/api/users/profile` (with token).
  - Allow editing name/email/password, PUT to `/api/users/profile`.
  - Show update success/error.
- Integration: Add profile link to navbar if logged in.

### Auth Context

- Create context/provider to store user info and token.
- Provide login, logout, register, update profile functions.
- Protect routes/components based on auth state.

---

## 2. Cart

### Cart Context/Logic

- Complete reducer in `CartContext.jsx`:
  - Actions: ADD, REMOVE, UPDATE, CLEAR.
  - Sync with backend: All cart actions should call backend endpoints and update context state.
- Store cart in context, fetch on login.

### Add to Cart

- Wire up “Add to Cart” buttons in `ProductCard` and `ProductPage`:
  - On click, POST to `/api/cart` with productId & quantity (default 1).
  - Update cart context after success.
  - Show feedback (e.g., “Added to cart!”).

### Cart Page/Component

- UI: List of cart items (image, name, price, quantity, remove button).
- Logic:
  - On mount, GET `/api/cart` (with token).
  - Allow changing quantity (PUT `/api/cart` with productId & new quantity).
  - Remove item (DELETE `/api/cart/:productId`).
  - Clear cart (DELETE `/api/cart/clear`).
  - Show total price.
  - “Proceed to Checkout” button.
- Integration: Add cart link to navbar with item count badge.

---

## 3. Orders

### Checkout Page

- UI: Form for shipping address (street, city, state, zip, country), payment method (dropdown).
- Logic:
  - On submit, POST to `/api/orders` with shippingAddress & paymentMethod.
  - On success, redirect to order confirmation page.
  - On error, show error message.

### Order Confirmation Page

- UI: Show order summary (items, shipping, total, status).
- Logic: Display info from order response after checkout.

### Order History Page

- UI: List of past orders (date, status, total, items).
- Logic: GET `/api/orders` (with token), display orders.

---

## 4. Admin Features

### Admin Orders Management

- UI: Table/list of all orders (orderId, user, status, total, actions).
- Logic:
  - GET all orders (admin endpoint, may need to add if not present).
  - Update order status (PUT `/api/orders/:orderId/status`).
  - Cancel order (PUT `/api/orders/:orderId/cancel`).

### Admin Users Management

- UI: Table/list of all users (name, email, role, actions).
- Logic:
  - GET all users (admin endpoint, may need to add if not present).
  - Delete user (DELETE `/api/users/:id`).

---

## 5. General

### Route Protection

- Protect routes (cart, orders, profile, admin pages) so only logged-in users (or admins) can access.
- Redirect to login if not authenticated.

### Logout

- Button in navbar: Clears token/context, redirects to login.

### Navbar Updates

- Show/hide links based on login/admin status: Cart, Orders, Profile, Admin, Login, Register, Logout.

### API Integration

- All protected API calls must send JWT token in `Authorization: Bearer <token>` header.

---

## 6. Optional/UX

- Loading states for all async actions.
- Error handling for all API calls.
- Success feedback (e.g., toast/snackbar) for actions like add to cart, order placed, profile updated.

---
