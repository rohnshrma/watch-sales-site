# Requirements (User + Cart Scope)

## Functional Scope
- Product listing/details
- Product CRUD management
- User auth (register/login/logout/profile)
- Cart linked to authenticated user account

## Explicitly Excluded
- Orders
- Payments

## Backend Requirements
- `/api/products` CRUD endpoints
- `/api/users` auth/profile endpoints
- `/api/cart` endpoints protected by bearer token
- Cart persistence by user id

## Frontend Requirements
- Auth pages and persistent auth session
- Protected cart/profile routes
- Add-to-cart redirects to login when unauthenticated
- Cart CRUD behavior for logged-in user
