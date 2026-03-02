# Frontend Flow (User + Cart Scope)

## 1) Boot (`src/main.jsx`)
Provider order:
1. `Router`
2. `AuthProvider`
3. `ProductProvider`
4. `CartProvider`
5. `App`

`CartProvider` depends on `AuthContext` for bearer headers.

## 2) Routing (`src/App.jsx`)
Public:
- `/`
- `/product/:id`
- `/user/register`
- `/user/login`
- `/add-product`
- `/manage-products`
- `/edit-product/:id`

Protected:
- `/cart`
- `/profile`

## 3) Auth Flow (`AuthContext`)
- Restores token/user from localStorage.
- `register()` and `login()` persist token + user.
- `logout()` clears session.
- `fetchProfile()` / `updateProfile()` sync backend profile.

## 4) Cart Flow (`CartContext`)
- Reads `authHeaders` from `AuthContext`.
- On auth login, fetches `/api/cart`.
- On logout, resets local cart state.
- Cart actions call protected cart endpoints.

## 5) Add-to-Cart Guard
- `ProductCard` and `ProductPage` redirect to `/user/login` if unauthenticated.

## 6) Removed/Excluded
- Checkout page
- Orders page
- Payment UI
