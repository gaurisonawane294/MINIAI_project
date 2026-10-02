# Frontend & UI/UX Specification

This document details the user interface design, page structure, component tree, client-side state management, and Tailwind CSS design guidelines for the **React.js + Vite** single page application.

---

## 1. Design System & Tailwind CSS Guidelines

The user interface follows a modern, clean, minimalist design aesthetic with high readability, balanced whitespace, and intuitive visual cues.

### 1.1 Color Palette
- **Primary / Brand**: Indigo / Blue (`indigo-600` primary, `indigo-700` hover, `indigo-50` subtle background)
- **Neutrals / Slate**: Slate palette (`slate-900` text, `slate-600` muted text, `slate-200` borders, `slate-50` page backgrounds)
- **Status & Badges**:
  - `Pending`: Amber badge (`bg-amber-100 text-amber-800 border-amber-200`)
  - `Confirmed`: Blue badge (`bg-blue-100 text-blue-800 border-blue-200`)
  - `Shipped`: Purple badge (`bg-purple-100 text-purple-800 border-purple-200`)
  - `Delivered`: Emerald badge (`bg-emerald-100 text-emerald-800 border-emerald-200`)
  - `Cancelled`: Rose badge (`bg-rose-100 text-rose-800 border-rose-200`)
- **Stock Indicators**:
  - In Stock: `text-emerald-600 bg-emerald-50`
  - Low Stock (<= 5 units): `text-amber-600 bg-amber-50`
  - Out of Stock (0 units): `text-rose-600 bg-rose-50`

### 1.2 Responsive Breakpoints
- **Mobile** (`< 640px`): Single-column product feed, mobile hamburger menu, stacked cart items, bottom action bars.
- **Tablet** (`640px - 1024px`): 2-column product grid, collapsable admin sidebar, side-by-side cart summary.
- **Desktop** (`> 1024px`): 3-to-4-column product grid, fixed admin sidebar, split checkout layout (form on left, order summary on right).

---

## 2. Public Storefront Pages

### 2.1 Navigation Bar (`components/layout/Navbar.jsx`)
- **Left**: Store Logo / Brand Title ("MiniStore").
- **Center**: Quick navigation links (`Home`, `Products`).
- **Right**:
  - Cart Icon with live badge count (e.g. `[3]`).
  - Auth Menu:
    - If Guest: "Login" and "Register" buttons.
    - If Customer: User name dropdown with "My Orders" and "Logout".
    - If Admin: "Admin Dashboard" quick-switch button.

---

### 2.2 Home Page (`pages/Home.jsx`)
- **Hero Banner**: Clean typography, value proposition ("Simple, Clean Shopping"), with a "Browse Products" CTA button.
- **Featured Categories**: Interactive cards for top categories (e.g., Electronics, Fashion, Shoes) with quick-filter links.
- **Recent Arrivals**: Top 4-8 newly added products with quick "Add to Cart" capability.

---

### 2.3 Products Catalog Page (`pages/Products.jsx`)
- **Header**: Search bar + category pill filters:
  ```text
  [ All ] [ Electronics ] [ Fashion ] [ Shoes ]
  ```
- **Search Input**: Live keyword search matching against product name or description.
- **Responsive Product Grid**:
  - 1 column on mobile, 2 columns on tablet, 3-4 columns on desktop.
- **Product Card (`components/product/ProductCard.jsx`)**:
  - High-res product image with hover zoom.
  - Category pill badge.
  - Product title & truncated description.
  - Formatted price (e.g. `$149.99`).
  - Stock badge ("In Stock: 12" or "Out of Stock").
  - "Add to Cart" button (disabled with visual cue if `stock === 0`).
- **Empty State**: Friendly illustration and message ("No products found matching your search").

---

### 2.4 Product Details Page (`pages/ProductDetails.jsx`)
- **Visuals**: Large high-resolution product preview.
- **Metadata**: Full description, category, and real-time inventory counter.
- **Interactive Controls**:
  - Quantity selector bounded between `1` and available `product.stock`.
  - Dynamic "Add to Cart" button.
  - Out of stock warning banner when `stock === 0`.

---

### 2.5 Shopping Cart Page (`pages/Cart.jsx`)
- **Item Listing**:
  - Thumbnail, product title, unit price.
  - Quantity controls (`-` and `+` buttons):
    - Disabled `-` when quantity is `1`.
    - Disabled `+` when quantity reaches `product.stock`.
    - Real-time stock limit notification if user attempts to exceed stock.
  - Remove line item button (Trash icon).
  - Item subtotal calculation.
- **Order Summary Sidebar**:
  - Subtotal, estimated shipping ($0.00 / Free), and Total.
  - "Proceed to Checkout" primary button.
- **Empty Cart State**: Icon, message ("Your cart is empty"), and a "Continue Shopping" button.

---

### 2.6 Checkout Page (`pages/Checkout.jsx`)
- **Prerequisite**: Must be authenticated (redirects to Login if guest, redirecting back upon auth).
- **Two-Column Responsive Layout**:
  - **Left Column (Shipping Form)**:
    - Name (pre-filled with logged-in user name)
    - Phone number
    - Delivery Address
    - City
    - Pincode
  - **Right Column (Order Summary & Payment)**:
    - Breakdown of line items, quantities, and final total.
    - Payment Method: Fixed **"Cash on Delivery" (COD)** with explanatory badge.
    - "Place Order" button with loading spinner state.
- **Post-Submission Flow**:
  - On success: Show confirmation toast, clear cart via `CartContext.clearCart()`, and redirect to `/my-orders`.

---

### 2.7 Customer "My Orders" Page (`pages/MyOrders.jsx`)
- Lists chronological order history for the logged-in customer.
- Each order card displays:
  - Order ID & placement date.
  - Status pill badge (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`).
  - List of purchased products with quantities and snapshot prices.
  - Total amount paid upon delivery.
  - Destination shipping address snapshot.
- Empty state: "You have not placed any orders yet."

---

### 2.8 Auth Pages (`pages/Login.jsx` & `pages/Register.jsx`)
- Centered, clean card layout.
- Real-time client-side validation errors (email format, matching passwords, min 6 characters).
- Seamless transition between login and registration.
- Auto-redirect upon successful authentication.

---

## 3. Admin Panel UI/UX

Accessible strictly to users with `role: "admin"` via `<AdminRoute>`.

### 3.1 Admin Layout & Sidebar (`components/layout/AdminLayout.jsx`)
- **Persistent Sidebar Navigation**:
  - Storefront Return Link
  - Dashboard Overview (`/admin`)
  - Categories (`/admin/categories`)
  - Products (`/admin/products`)
  - Orders (`/admin/orders`)
- **Top Bar**: Admin name, status badge, and Logout button.

---

### 3.2 Admin Categories Management (`pages/admin/AdminCategories.jsx`)
- **Header**: "Categories" title and "+ Add Category" button.
- **Data Table**:
  - Columns: Category Name, Description, Actions (Edit, Delete).
- **Add / Edit Modal**:
  - Fields: `name` (required), `description`.
  - Save button with loading indicator.
- **Delete Confirmation Dialog**:
  - Modal: "Are you sure you want to delete this category? Products associated with it may be affected."
  - Cancel & Confirm Delete buttons.

---

### 3.3 Admin Products Management (`pages/admin/AdminProducts.jsx`)
- **Header**: "Products" title and "+ Add Product" button.
- **Data Table**:
  - Columns: Image preview, Product Name, Category, Price, Stock, Actions (Edit, Delete).
  - Low stock warning badges when stock <= 5.
- **Add / Edit Modal Form**:
  - Product Name (text input)
  - Category (dropdown populated from `/api/categories`)
  - Price (number input, min: 0, step: 0.01)
  - Stock (number input, integer, min: 0)
  - Image URL (text input with live thumbnail preview)
  - Description (textarea)
- **Delete Action**: Triggers confirmation dialog prior to API call.

---

### 3.4 Admin Orders Management (`pages/admin/AdminOrders.jsx`)
- **Header**: "Customer Orders" title with count indicator.
- **Data Table**:
  - Order ID & Date
  - Customer Name & Contact Phone
  - Purchased Items summary
  - Total Amount ($)
  - Payment Method (Cash on Delivery)
  - Order Status (Dropdown selector with colored badges)
- **Status Change Action**:
  - Changing the dropdown value (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`) immediately sends `PATCH /api/admin/orders/:id/status` and displays a toast message upon confirmation.

---

## 4. Reusable Component Catalog

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| `Button` | `components/common/Button.jsx` | Standardized primary, secondary, danger, and ghost styles with loading state |
| `Input` | `components/common/Input.jsx` | Label, error message rendering, focus rings, disabled states |
| `ConfirmModal`| `components/common/ConfirmModal.jsx` | Modal overlay for confirming destructive actions (Delete product/category) |
| `Toast` | `components/common/Toast.jsx` | Animated notification for success/error feedback (auto-dismiss 3s) |
| `LoadingSpinner`| `components/common/LoadingSpinner.jsx`| SVG spinner for data fetching states |
| `EmptyState` | `components/common/EmptyState.jsx` | Visual placeholder when tables or lists contain no records |
| `StatusBadge` | `components/common/StatusBadge.jsx`| Standardized color-coded order status badge |
