# Watch Sales Site Backend

Backend API for the watch sales project, built with Express + MongoDB (Mongoose) and JWT-based authentication.

## Tech Stack
- Node.js (ES modules)
- Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- CORS + Morgan + Dotenv

## Project Structure
```txt
backend/
  config/
    db.js
  controllers/
    productController.js
    cartController.js
    userController.js
    orderController.js
  middlewares/
    authMiddleware.js
  models/
    product.js
    cart.js
    user.js
    order.js
  routes/
    productRoutes.js
    cartRoutes.js
    userRoutes.js
    orderRoutes.js
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
JWT_SECRET=your_jwt_secret
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
Token is returned from register/login.

## API Routes

### Product Routes (`/api/products`)
- `GET /` -> Get all products
- `POST /` -> Add product
- `GET /:id` -> Get single product
- `PUT /:id` -> Update product
- `DELETE /:id` -> Delete product

### Cart Routes (`/api/cart`) (Protected)
- `POST /` -> Add item to cart
- `GET /` -> Get logged-in user cart
- `PUT /` -> Update cart item quantity
- `DELETE /clear` -> Clear full cart
- `DELETE /:productId` -> Remove one cart item

### User Routes (`/api/users`)
- `POST /register` -> Register user
- `POST /login` -> Login user
- `GET /profile` (Protected) -> Get profile
- `PUT /profile` (Protected) -> Update profile
- `DELETE /:id` (Protected) -> Delete user by id

### Order Routes (`/api/orders`) (Protected)
- `POST /` -> Create order from current cart
- `GET /` -> Get logged-in user orders

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
  "price": "4999",
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

### Create Order
```json
{
  "shippingAddress": {
    "street": "MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India"
  },
  "paymentMethod": "upi"
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

## Detailed Flow Doc
For a detailed explanation of server startup, route flow, and each controller/model, see:
- `BACKEND_FLOW.md`

