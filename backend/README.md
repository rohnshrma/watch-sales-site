# Watch Sales Backend (User + Cart Scope)

Backend API for the `user_and_cart` branch.

Current backend scope:
- Product catalog + product management
- User registration/login/profile
- Auth-protected cart linked to authenticated user

Out of scope:
- Orders
- Payment

## Tech Stack
- Node.js (ES modules)
- Express
- MongoDB + Mongoose
- CORS + Morgan + Dotenv
- Built-in Node crypto-based auth token + password hashing

## Project Structure
```txt
backend/
  config/
    db.js
  controllers/
    productController.js
    cartController.js
    userController.js
  middlewares/
    authMiddleware.js
  models/
    product.js
    cart.js
    user.js
  routes/
    productRoutes.js
    cartRoutes.js
    userRoutes.js
  utils/
    generateToken.js
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
JWT_SECRET=your_secret_key
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

## Auth
Protected routes require:
```http
Authorization: Bearer <token>
```

Token is returned by login/register and refreshed on profile update.

## API Routes

### Product Routes (`/api/products`)
- `GET /` -> Get all products
- `POST /` -> Add product
- `GET /:id` -> Get single product
- `PUT /:id` -> Update product
- `DELETE /:id` -> Delete product

### User Routes (`/api/users`)
- `POST /register` -> Register user
- `POST /login` -> Login user
- `GET /profile` (Protected) -> Get profile
- `PUT /profile` (Protected) -> Update profile

### Cart Routes (`/api/cart`) (Protected)
- `GET /` -> Get current user's cart
- `POST /` -> Add item to cart
- `PUT /` -> Update cart item quantity
- `DELETE /clear` -> Clear full cart
- `DELETE /:productId` -> Remove one cart item

## Request Body Examples

### Register
```json
{
  "name": "Rohan",
  "email": "rohan@example.com",
  "password": "password123"
}
```

### Login
```json
{
  "email": "rohan@example.com",
  "password": "password123"
}
```

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

## Notes
- One cart per user (`cart.user` is unique).
- Cart APIs are accessible only with valid bearer token.
- Orders and payment endpoints are intentionally removed from this branch.
