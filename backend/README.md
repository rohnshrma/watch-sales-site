# Watch Sales Backend (Cart Brand Scope)

Backend API for the cart-brand version of the project.

Current backend scope is intentionally limited to:
- Product catalog + product management
- Cart management

Removed from scope:
- User accounts
- Authentication/authorization
- Orders
- Payment

## Tech Stack
- Node.js (ES modules)
- Express
- MongoDB + Mongoose
- CORS + Morgan + Dotenv

## Project Structure
```txt
backend/
  config/
    db.js
  controllers/
    productController.js
    cartController.js
  models/
    product.js
    cart.js
  routes/
    productRoutes.js
    cartRoutes.js
  server.js
```

## Setup
1. Install dependencies:
```bash
npm install
```
2. Create `.env`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
```
3. Run in development:
```bash
npm run dev
```
4. Run in production:
```bash
npm start
```

## Base URL
`http://localhost:3000`

## Cart Identity (No Auth)
Cart endpoints use a request header to identify a cart:

```http
x-cart-id: cart_abc123
```

If your frontend uses this backend, keep one `x-cart-id` per browser/user (usually in localStorage).

## API Routes

### Product Routes (`/api/products`)
- `GET /` -> Get all products
- `POST /` -> Add product
- `GET /:id` -> Get single product
- `PUT /:id` -> Update product
- `DELETE /:id` -> Delete product

### Cart Routes (`/api/cart`)
- `GET /` -> Get cart by `x-cart-id`
- `POST /` -> Add item to cart
- `PUT /` -> Update cart item quantity
- `DELETE /clear` -> Clear full cart
- `DELETE /:productId` -> Remove one cart item

## Request Body Examples

### Add Product
```json
{
  "name": "Omega Speedmaster",
  "price": 4999,
  "description": "Chronograph watch with sapphire crystal and steel case.",
  "imageUrl": "https://example.com/watch.jpg"
}
```

### Add to Cart / Update Cart
```json
{
  "productId": "64f6d5e9c4f8b7a9e0123456",
  "quantity": 2
}
```

## Response Format
Most endpoints return:
```json
{
  "status": "success|fail",
  "message": "text",
  "data": {}
}
```

## Important Validation/Behavior Notes
- Product `price` is numeric in DB.
- Cart quantity rules:
  - `POST /api/cart`: `quantity` must be a positive integer.
  - `PUT /api/cart`: `quantity` must be a non-negative integer (`0` removes item).
- `x-cart-id` header is required for all cart endpoints.

## Detailed Flow Doc
For request flow and controller/model notes, see:
- `BACKEND_FLOW.md`
