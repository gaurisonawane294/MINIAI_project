# Security, Validation & Stock Integrity

This document outlines the security architecture, input validation rules, cryptographic standards, and stock consistency guarantees enforced across the application.

---

## 1. Zero-Trust Pricing Architecture

### Core Principle
> **Rule**: Under no circumstances should product prices submitted by the client be trusted or persisted in order records.

### Vulnerability Vector
In insecure e-commerce applications, malicious users can manipulate HTTP payloads using developer tools or proxy intercepts (e.g., submitting `price: 0.01` instead of `149.99`):
```json
// INSECURE PAYLOAD SENT BY ATTACKER
{
  "items": [
    { "productId": "651a20014d5e6f7a8b9c0001", "price": 0.01, "quantity": 1 }
  ]
}
```

### Server-Enforced Remediation
The backend controller strictly extracts only the `product` ID and `quantity` from the client request. The actual monetary price is retrieved directly from MongoDB:

```javascript
// orderController.js (Secure Implementation)
let totalAmount = 0;
const orderProducts = [];

for (const item of req.body.items) {
  const product = await Product.findById(item.product);
  
  if (!product) {
    return res.status(404).json({ message: `Product ${item.product} not found` });
  }

  if (product.stock < item.quantity) {
    return res.status(400).json({
      message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
    });
  }

  // Price is strictly fetched from database document
  const itemPrice = product.price;
  totalAmount += itemPrice * item.quantity;

  orderProducts.push({
    product: product._id,
    name: product.name,
    quantity: item.quantity,
    price: itemPrice, // Captured immutable snapshot
  });
}
```

---

## 2. Authentication & Authorization Security

### 2.1 Password Security
- **Hashing Algorithm**: `bcryptjs` with salt work factor of `10`.
- **Pre-save Hook**: Passwords are automatically hashed prior to MongoDB persistence only when modified or newly created.
- **Exposure Prevention**: Password hashes are explicitly excluded from query responses using projection:
  ```javascript
  const user = await User.findById(req.user.id).select('-password');
  ```

### 2.2 JWT (JSON Web Tokens) Implementation
- **Payload**: Minimal claims containing only `id` and `role`:
  ```javascript
  {
    "id": "651a2b3c4d5e6f7a8b9c0d1e",
    "role": "customer",
    "iat": 1759400000,
    "exp": 1760004800
  }
  ```
- **Signing Key**: Sourced strictly from environment variable `process.env.JWT_SECRET`.
- **Expiration**: Standard validity of 7 days (`7d`).

### 2.3 Middleware Execution Pipeline

```text
Request ---> authMiddleware (verifies JWT, loads user) ---> adminMiddleware (verifies role === 'admin') ---> Controller
```

- **`authMiddleware`**:
  1. Reads `req.headers.authorization`.
  2. Extracts token after the `Bearer ` prefix.
  3. Verifies token with `jwt.verify(token, JWT_SECRET)`.
  4. Queries user by decoded ID, attaches user record to `req.user`.
  5. Responds with `401 Unauthorized` if token is absent, expired, or invalid.

- **`adminMiddleware`**:
  1. Checks `req.user && req.user.role === 'admin'`.
  2. Responds with `403 Forbidden ("Access denied: Administrator privileges required")` if unauthorized.

---

## 3. Inventory Stock Integrity & Concurrency

### 3.1 Dual-Level Stock Validation

1. **Frontend Guard (UX Pre-validation)**:
   - "Add to Cart" button is disabled when product stock is `0`.
   - Cart quantity increments (`+`) are clamped to maximum available stock.
   - Prevents accidental submission of unfillable orders.

2. **Backend Guard (Definitive Validation)**:
   - Prior to creating an order document, the backend verifies that every item has `product.stock >= requestedQuantity`.
   - If any item fails validation, the entire transaction is aborted and a `400 Bad Request` is returned.

### 3.2 Atomic Stock Decrement
To prevent overselling and negative inventory, stock is decremented atomically:

```javascript
await Product.findByIdAndUpdate(item.product, {
  $inc: { stock: -item.quantity },
});
```

---

## 4. Comprehensive Validation Rules

### 4.1 User Domain
| Field | Rule | Backend Check | Frontend Check |
| :--- | :--- | :--- | :--- |
| `name` | Non-empty string, max 100 chars | Mongoose `required`, `maxlength` | HTML5 `required`, trimmed |
| `email` | Valid email syntax, unique | Regex match, MongoDB unique index | Input type `email`, regex validation |
| `password` | Min 6 characters | Mongoose `minlength: 6` | Input `minlength="6"` |
| `confirmPassword` | Exact match with `password` | Controller check in `/register` | Form state comparison |

### 4.2 Category Domain
| Field | Rule | Backend Check | Frontend Check |
| :--- | :--- | :--- | :--- |
| `name` | Non-empty string, max 50 chars, unique | Mongoose `required`, `unique` | HTML5 `required`, trimmed |
| `description`| Max 250 chars | Mongoose `maxlength: 250` | Input `maxlength="250"` |

### 4.3 Product Domain
| Field | Rule | Backend Check | Frontend Check |
| :--- | :--- | :--- | :--- |
| `name` | Non-empty string, max 150 chars | Mongoose `required`, `maxlength` | HTML5 `required`, trimmed |
| `description`| Non-empty string | Mongoose `required` | Form textarea required |
| `price` | Number, strictly positive (`> 0`) | Mongoose `min: 0` | Input type `number`, `min="0.01"`, `step="0.01"` |
| `stock` | Integer, non-negative (`>= 0`) | Mongoose `min: 0`, integer check | Input type `number`, `min="0"`, `step="1"` |
| `image` | Valid URL string | Mongoose `required` | Input type `url` |
| `category` | Valid existing MongoDB ObjectId | Mongoose `ref: 'Category'` | Dropdown select from existing categories |

### 4.4 Order & Checkout Domain
| Field | Rule | Backend Check | Frontend Check |
| :--- | :--- | :--- | :--- |
| `items` | Array containing at least 1 item | Controller check `items.length > 0`| Checkout button disabled if cart is empty |
| `quantity` | Integer >= 1 | Controller check & schema check | Clamped in cart UI (`min: 1`, `max: stock`) |
| `shippingAddress.name` | Non-empty string | Schema `required` | Form required |
| `shippingAddress.phone` | Valid contact number format | Schema `required` | Form required, phone pattern |
| `shippingAddress.address` | Non-empty street address | Schema `required` | Form required |
| `shippingAddress.city` | Non-empty city | Schema `required` | Form required |
| `shippingAddress.pincode` | Postal code format | Schema `required` | Form required |
| `status` | Enum check | `['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']` | Select options matching enum |

---

## 5. Error Handling & Information Leaks

1. **Centralized Error Middleware**:
   - Catches unhandled errors without crashing the Node.js process.
   - In production (`NODE_ENV=production`), stack traces are omitted from JSON responses.
2. **CORS Configuration**:
   - Configured with `cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true })` to restrict unauthorized domain origins.
3. **No Sensitive Data in Logs**:
   - Passwords and auth tokens are excluded from console logging.
