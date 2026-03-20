# Backend Flow

This branch now uses Razorpay for checkout verification instead of Stripe.

## Environment

Required backend variables:

- `MONGO_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Optional backend variables:

- `RAZORPAY_CURRENCY` default: `INR`

If either Razorpay key is missing, payment-order creation and Razorpay-backed order creation will fail.

## Order Routes

- `POST /api/orders/payment-order`
  Creates a Razorpay order for the authenticated user's current cart total.
- `POST /api/orders`
  Creates an order. For Razorpay payments, this also verifies the Razorpay signature and payment details.
- `GET /api/orders`
  Returns the current user's orders.
- `GET /api/orders/:orderId`
  Returns one order if the requester is the owner or an admin.
- `PUT /api/orders/:orderId/cancel`
  Cancels an order unless it is already shipped, delivered, or cancelled.
- `GET /api/orders/admin/all`
  Admin-only full order list.
- `PUT /api/orders/:orderId/status`
  Admin-only status and payment-status update.

## Razorpay Utility

`utils/razorpay.js` centralizes payment configuration:

- `getRazorpayClient()` lazily builds and reuses the SDK client
- `getRazorpayCurrency()` returns `RAZORPAY_CURRENCY` or `INR`
- `getRazorpayKeyId()` returns the public key id for frontend checkout bootstrapping

## Checkout Flow

### 1. Create Razorpay Order

`POST /api/orders/payment-order`

Request body:

```json
{
  "shippingAddress": {
    "street": "MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "IN"
  }
}
```

Backend steps:

1. Validates shipping fields.
2. Loads the authenticated user's cart.
3. Rejects empty carts.
4. Creates a Razorpay order using the latest cart total.
5. Saves user/cart context in Razorpay `notes`.
6. Returns:

```json
{
  "status": "success",
  "message": "Razorpay order created successfully",
  "data": {
    "orderId": "order_xxx",
    "keyId": "rzp_test_xxx",
    "amount": 2499,
    "amountInPaise": 249900,
    "currency": "INR"
  }
}
```

This endpoint does not create the app order yet. It only prepares Razorpay checkout.

### 2. Create Order After Razorpay Payment

`POST /api/orders`

For normal offline/manual methods, the controller creates a pending order directly.

For Razorpay:

```json
{
  "shippingAddress": {
    "street": "MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "IN"
  },
  "paymentMethod": "razorpay",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

Backend verification steps:

1. Validates address and loads the current cart.
2. Requires all three Razorpay identifiers.
3. Blocks duplicate order creation for the same payment id.
4. Verifies the HMAC signature using `RAZORPAY_KEY_SECRET`.
5. Fetches the payment and order from Razorpay.
6. Confirms the Razorpay order belongs to the authenticated user through `notes.userId`.
7. Confirms the payment is tied to the supplied Razorpay order.
8. Confirms the paid amount matches the live cart total.
9. Creates the order with:
   - `paymentMethod: "razorpay"`
   - `paymentStatus: "completed"`
   - `status: "confirmed"`
   - `paymentReferenceId`
   - `paidAt`
   - `paymentResult`
10. Clears the cart.

## Order Model Notes

`models/order.js` stores:

- shipping address
- ordered items snapshot
- delivery status
- payment status
- `paymentReferenceId`
- `paymentResult.id`
- `paymentResult.orderId`
- `paymentResult.status`
- `paymentResult.currency`
- `paymentResult.amount`
- `paymentResult.method`
- `paymentResult.signatureVerified`

## Safety Properties

- The backend does not trust the frontend's payment success callback by itself.
- Signature verification happens server-side before a Razorpay-backed order is created.
- The backend rechecks Razorpay payment/order details against the current cart total.
- Duplicate order creation is blocked per Razorpay payment id.
- Order cancellation in this branch does not trigger automatic Razorpay refunds.
