# Frontend Requirements Status (Cart Brand Scope)

## Completed
- Product listing + search + sort
- Product detail page
- Add product page
- Manage products page (edit/delete actions)
- Edit product page
- Cart context integrated with backend cart endpoints
- Cart page with update/remove/clear/total
- Navbar links for Home, Product Management, Cart
- Frontend build passes

## Deliberately Removed
- Login/Register/Profile
- Auth context and protected routes
- Checkout/Orders flow
- Payment fields and payment status UI

## Notes
- Cart requests use `x-cart-id` generated and persisted in localStorage.
- Backend must be running at `VITE_API_BASE_URL` (or `http://localhost:3000` fallback).
