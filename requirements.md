# Project Requirements (Current Scope)

## Active Scope
- Product catalog browsing
- Product CRUD management
- Cart management

## Removed Scope
- User accounts
- Authentication/authorization
- Orders
- Payments

## Backend Requirements
- Expose product APIs (`GET/POST/PUT/DELETE /api/products`)
- Expose cart APIs (`GET/POST/PUT/DELETE /api/cart*`)
- Cart APIs must work with `x-cart-id` header
- Persist products/carts in MongoDB

## Frontend Requirements
- Home product listing with search/sort
- Product details page
- Add/edit/delete product pages
- Cart page with quantity update/remove/clear/total
- Persistent browser cart identity via localStorage
- No login, no checkout, no orders

## Non-Functional
- App should build successfully (`frontend`)
- Backend should start successfully (`backend`)
