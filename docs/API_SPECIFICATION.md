# REST API Specification

This document provides complete documentation for the RESTful endpoints provided by the backend API.

---

## 1. Global Conventions

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header:
  ```http
  Authorization: Bearer <jwt_token_here>
  ```
- **Standard Error Response Format**:
  ```json
  {
    "success": false,
    "message": "Error description message"
  }
  ```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register New User
Creates a customer account.

- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Validation**:
  - `name`: Required, non-empty.
  - `email`: Required, valid email format, unique in database.
  - `password`: Required, minimum 6 characters.
  - `confirmPassword`: Must match `password`.
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651a2b3c4d5e6f7a8b9c0d1e",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or passwords do not match.
  - `409 Conflict`: Email already registered.

---

### 2.2 Login User / Admin
Authenticates either a customer or administrator and returns a JWT token.

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651a2b3c4d5e6f7a8b9c0d1e",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid credentials.

---

## 3. Categories Endpoints (`/api/categories`)

### 3.1 Get All Categories
Retrieves all available categories for the storefront filter and admin panel.

- **Method**: `GET`
- **URL**: `/api/categories`
- **Access**: Public
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 3,
    "categories": [
      {
        "_id": "651a10014d5e6f7a8b9c0001",
        "name": "Electronics",
        "description": "Smartphones, laptops, accessories and audio gear",
        "createdAt": "2026-09-30T10:00:00.000Z"
      },
      {
        "_id": "651a10014d5e6f7a8b9c0002",
        "name": "Fashion",
        "description": "Trendy apparel for men, women and kids",
        "createdAt": "2026-09-30T10:05:00.000Z"
      }
    ]
  }
  ```

---

### 3.2 Create Category
Adds a new category to the store.

- **Method**: `POST`
- **URL**: `/api/categories`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
  ```json
  {
    "name": "Shoes",
    "description": "Footwear, sneakers, boots and sandals"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "category": {
      "_id": "651a10014d5e6f7a8b9c0003",
      "name": "Shoes",
      "description": "Footwear, sneakers, boots and sandals",
      "createdAt": "2026-10-01T12:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Name is missing or exceeds limits.
  - `401 Unauthorized`: No token provided.
  - `403 Forbidden`: User is not an admin.
  - `409 Conflict`: Category with this name already exists.

---

### 3.3 Update Category
Updates an existing category's name or description.

- **Method**: `PUT`
- **URL**: `/api/categories/:id`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
  ```json
  {
    "name": "Footwear & Shoes",
    "description": "Updated category description"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category updated successfully",
    "category": {
      "_id": "651a10014d5e6f7a8b9c0003",
      "name": "Footwear & Shoes",
      "description": "Updated category description",
      "updatedAt": "2026-10-01T12:30:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Category ID does not exist.

---

### 3.4 Delete Category
Removes a category.

- **Method**: `DELETE`
- **URL**: `/api/categories/:id`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category deleted successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Cannot delete category if products are still associated with it.
  - `404 Not Found`: Category not found.

---

## 4. Products Endpoints (`/api/products`)

### 4.1 Get All Products (Filter & Search)
Retrieves products with optional search query and category filtering.

- **Method**: `GET`
- **URL**: `/api/products`
- **Query Parameters**:
  - `category` *(optional)*: Category ObjectId or Category Name (e.g. `?category=electronics`)
  - `search` *(optional)*: Keyword matching against product name or description (e.g. `?search=phone`)
- **Example URL**: `/api/products?category=electronics&search=phone`
- **Access**: Public
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "products": [
      {
        "_id": "651a20014d5e6f7a8b9c0001",
        "name": "Wireless Noise-Cancelling Headphones",
        "description": "Premium over-ear wireless headphones with active noise cancellation",
        "price": 149.99,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "category": {
          "_id": "651a10014d5e6f7a8b9c0001",
          "name": "Electronics"
        },
        "stock": 25,
        "createdAt": "2026-09-30T11:00:00.000Z"
      }
    ]
  }
  ```

---

### 4.2 Get Single Product Details
- **Method**: `GET`
- **URL**: `/api/products/:id`
- **Access**: Public
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "product": {
      "_id": "651a20014d5e6f7a8b9c0001",
      "name": "Wireless Noise-Cancelling Headphones",
      "description": "Premium over-ear wireless headphones with active noise cancellation",
      "price": 149.99,
      "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "category": {
        "_id": "651a10014d5e6f7a8b9c0001",
        "name": "Electronics"
      },
      "stock": 25
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Product not found.

---

### 4.3 Create Product
- **Method**: `POST`
- **URL**: `/api/products`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
  ```json
  {
    "name": "Classic White Sneakers",
    "description": "Breathable cushioned athletic running shoes",
    "price": 79.99,
    "image": "https://images.unsplash.com/photo-1549298916-b41d501d3772",
    "category": "651a10014d5e6f7a8b9c0003",
    "stock": 40
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "product": {
      "_id": "651a20014d5e6f7a8b9c0002",
      "name": "Classic White Sneakers",
      "price": 79.99,
      "stock": 40
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing fields or invalid price/stock numbers.

---

### 4.4 Update Product
- **Method**: `PUT`
- **URL**: `/api/products/:id`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
  ```json
  {
    "name": "Classic White Sneakers - 2026 Edition",
    "price": 84.99,
    "stock": 35
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "product": {
      "_id": "651a20014d5e6f7a8b9c0002",
      "name": "Classic White Sneakers - 2026 Edition",
      "price": 84.99,
      "stock": 35
    }
  }
  ```

---

### 4.5 Delete Product
- **Method**: `DELETE`
- **URL**: `/api/products/:id`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
  }
  ```

---

## 5. Orders Endpoints (`/api/orders`)

### 5.1 Create Order (Checkout)
Places a new order using Cash on Delivery. Prices are looked up securely from MongoDB.

- **Method**: `POST`
- **URL**: `/api/orders`
- **Access**: Private (Authenticated Customer)
- **Headers**: `Authorization: Bearer <customer_token>`
- **Request Body**:
  ```json
  {
    "items": [
      {
        "product": "651a20014d5e6f7a8b9c0001",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "address": "123 Elm Street, Apt 4B",
      "city": "Metropolis",
      "pincode": "10001"
    }
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "order": {
      "_id": "651a30014d5e6f7a8b9c0099",
      "user": "651a2b3c4d5e6f7a8b9c0d1e",
      "products": [
        {
          "product": "651a20014d5e6f7a8b9c0001",
          "name": "Wireless Noise-Cancelling Headphones",
          "quantity": 2,
          "price": 149.99
        }
      ],
      "totalAmount": 299.98,
      "shippingAddress": {
        "name": "Jane Doe",
        "phone": "+1234567890",
        "address": "123 Elm Street, Apt 4B",
        "city": "Metropolis",
        "pincode": "10001"
      },
      "paymentMethod": "Cash on Delivery",
      "status": "Pending",
      "createdAt": "2026-10-02T12:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Cart is empty or requested quantity exceeds available stock.
  - `404 Not Found`: One of the requested product IDs does not exist.

---

### 5.2 Get Customer Order History
Retrieves all orders placed by the authenticated customer.

- **Method**: `GET`
- **URL**: `/api/orders/my-orders`
- **Access**: Private (Authenticated Customer)
- **Headers**: `Authorization: Bearer <customer_token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "orders": [
      {
        "_id": "651a30014d5e6f7a8b9c0099",
        "products": [
          {
            "name": "Wireless Noise-Cancelling Headphones",
            "quantity": 2,
            "price": 149.99
          }
        ],
        "totalAmount": 299.98,
        "shippingAddress": {
          "address": "123 Elm Street, Apt 4B",
          "city": "Metropolis",
          "pincode": "10001"
        },
        "status": "Pending",
        "createdAt": "2026-10-02T12:00:00.000Z"
      }
    ]
  }
  ```

---

### 5.3 Admin: Get All Customer Orders
Retrieves all orders in the system with customer profile details populated.

- **Method**: `GET`
- **URL**: `/api/admin/orders`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 25,
    "orders": [
      {
        "_id": "651a30014d5e6f7a8b9c0099",
        "user": {
          "_id": "651a2b3c4d5e6f7a8b9c0d1e",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "products": [
          {
            "name": "Wireless Noise-Cancelling Headphones",
            "quantity": 2,
            "price": 149.99
          }
        ],
        "totalAmount": 299.98,
        "shippingAddress": {
          "name": "Jane Doe",
          "phone": "+1234567890",
          "address": "123 Elm Street, Apt 4B",
          "city": "Metropolis",
          "pincode": "10001"
        },
        "status": "Pending",
        "createdAt": "2026-10-02T12:00:00.000Z"
      }
    ]
  }
  ```

---

### 5.4 Admin: Update Order Status
Transitions the order through its fulfillment status pipeline.

- **Method**: `PATCH`
- **URL**: `/api/admin/orders/:id/status`
- **Access**: Private (Admin Only)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request Body**:
  ```json
  {
    "status": "Shipped"
  }
  ```
- **Allowed Status Values**:
  - `'Pending'`
  - `'Confirmed'`
  - `'Shipped'`
  - `'Delivered'`
  - `'Cancelled'`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order status updated successfully",
    "order": {
      "_id": "651a30014d5e6f7a8b9c0099",
      "status": "Shipped",
      "updatedAt": "2026-10-02T12:45:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid status provided.
  - `404 Not Found`: Order not found.
