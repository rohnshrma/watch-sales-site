# Frontend Flow

This frontend now uses Razorpay checkout instead of Stripe.

## Environment

Required frontend variable:

- `VITE_RAZORPAY_KEY_ID`

If it is missing, the checkout page shows a warning instead of opening payments.

## Order Context

`src/context/OrderContext.jsx` exposes:

- `fetchOrders()`
- `createRazorpayOrder(payload)` -> `POST /api/orders/payment-order`
- `createOrder(payload)` -> `POST /api/orders`
- `cancelOrder(orderId)` -> `PUT /api/orders/:orderId/cancel`

## Checkout Page

`src/Pages/Checkout.jsx` handles the payment flow.

### Page behavior

1. Collects shipping address fields.
2. Rejects submission when the cart is empty.
3. Loads the Razorpay checkout script on demand.
4. Calls `createRazorpayOrder(...)` with shipping details.
5. Opens the Razorpay popup using:
   - backend `orderId`
   - backend `keyId`
   - amount in paise
   - logged-in user prefill values
6. After Razorpay returns success, calls `createOrder(...)` with:
   - `paymentMethod: "razorpay"`
   - `razorpayOrderId`
   - `razorpayPaymentId`
   - `razorpaySignature`
7. Refreshes the cart and redirects to `/orders`.

### Error handling

The page surfaces:

- empty-cart validation
- Razorpay script load failures
- popup dismissal
- backend signature/payment validation failures

## Orders Page

`src/Pages/Orders.jsx` now displays:

- order status
- payment status
- payment method
- Razorpay payment reference id when present

## Key UX Difference From The Old Flow

The app no longer renders an inline card form. Payment happens in Razorpay's hosted checkout popup after the user submits shipping details.
