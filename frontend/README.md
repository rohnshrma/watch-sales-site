# Watch Sales Frontend

Frontend for the Watch Store project, built with React + Vite.  
This app displays products, supports admin product management UI, and connects to a backend API for product CRUD.

## Tech Stack

- React 19
- Vite
- React Router DOM
- Context API + `useReducer`
- Axios
- Bootstrap 4

## Project Structure

```txt
src/
  main.jsx
  App.jsx
  Components/
    Nav.jsx
    ProductCard.jsx
  Pages/
    Home.jsx
    ProductPage.jsx
    AddProduct.jsx
    Register.jsx
    Admin/
      AdminDashboard.jsx
      ManageProducts.jsx
      EditProduct.jsx
  context/
    ProductContext.jsx
    CartContext.jsx
```

## How It Starts

1. `src/main.jsx` is the entry point.
2. It wraps the app with:
   - `StrictMode`
   - `BrowserRouter`
   - `ProductProvider`
3. Then it renders `App`.

## Routing (`App.jsx`)

`App.jsx` renders `Nav` and defines routes:

- `/` -> `Home`
- `/add-product` -> `AddProduct`
- `/product/:id` -> `ProductPage`
- `/admin/dashboard` -> `AdminDashboard`
- `/admin/manage-products` -> `ManageProducts`
- `/admin/edit-product/:id` -> `EditProduct`
- `/user/register` -> `Register`

## State Management

`ProductContext.jsx` provides:

- State:
  - `products`
  - `product`
- API functions:
  - `fetchProducts()`
  - `fetchProduct(id)`
  - `addNewProduct(product)`
  - `editProduct(id, updatedProduct)`
  - `deleteProduct(id)`

The context uses `useReducer` with action types:

- `ADD`
- `FETCH_PRODUCTS`
- `FETCH_PRODUCT`

## API Dependency

The frontend expects backend endpoints at:

- `GET http://localhost:3000/api/products`
- `GET http://localhost:3000/api/products/:id`
- `POST http://localhost:3000/api/products`
- `PUT http://localhost:3000/api/products/:id`
- `DELETE http://localhost:3000/api/products/:id`

Make sure backend is running before using product features.

## Run Locally

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Frontend Flow Document

Detailed flow is documented in:

- `FRONTEND_FLOW.md`
