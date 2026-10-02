const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
  },
  name: {
    type: String,
    required: [true, 'Product name snapshot is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Price snapshot is required'],
    min: [0, 'Price must be positive'],
  },
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Recipient name is required'], trim: true },
  phone: { type: String, required: [true, 'Recipient phone number is required'], trim: true },
  address: { type: String, required: [true, 'Shipping address is required'], trim: true },
  city: { type: String, required: [true, 'City is required'], trim: true },
  pincode: { type: String, required: [true, 'Pincode is required'], trim: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    products: {
      type: [orderItemSchema],
      required: [true, 'Order products are required'],
      validate: [val => Array.isArray(val) && val.length > 0, 'Order must contain at least one product'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be positive'],
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
