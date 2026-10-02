const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Create a new order (Checkout pipeline with zero-trust pricing)
 * @route   POST /api/orders
 * @access  Private (Authenticated Customer)
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    // Validate non-empty items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required and cannot be empty',
      });
    }

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    const { name, phone, address, city, pincode } = shippingAddress;
    if (!name || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all shipping address fields: name, phone, address, city, and pincode',
      });
    }

    let totalAmount = 0;
    const orderProducts = [];
    const stockDecrements = [];

    // Zero-Trust Pricing and Stock Check from Database
    for (const item of items) {
      const prodId = item.product || item.productId || item._id;
      const quantity = Number(item.quantity);

      if (!prodId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product reference in items array',
        });
      }

      if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${prodId}: must be an integer >= 1`,
        });
      }

      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${prodId} not found`,
        });
      }

      // Stock Check
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${quantity}`,
        });
      }

      // Price is strictly fetched from database document (Zero-Trust)
      const itemPrice = product.price;
      totalAmount += itemPrice * quantity;

      orderProducts.push({
        product: product._id,
        name: product.name,
        quantity,
        price: itemPrice, // Captured immutable snapshot
      });

      stockDecrements.push({
        productId: product._id,
        quantity,
      });
    }

    // Atomic Stock Decrement via MongoDB $inc
    for (const dec of stockDecrements) {
      await Product.findByIdAndUpdate(dec.productId, {
        $inc: { stock: -dec.quantity },
      });
    }

    // Round total to 2 decimal places to avoid floating point precision artifacts
    const roundedTotal = Math.round(totalAmount * 100) / 100;

    // Persist new order with initial status "Pending"
    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      totalAmount: roundedTotal,
      shippingAddress: {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      },
      paymentMethod: 'Cash on Delivery',
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order history for the authenticated customer
 * @route   GET /api/orders/my-orders
 * @access  Private (Authenticated Customer)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Get all customer orders with customer details
 * @route   GET /api/admin/orders
 * @access  Private (Admin Only)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Update order fulfillment status
 * @route   PATCH /api/admin/orders/:id/status
 * @access  Private (Admin Only)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // If order was cancelled, restore the inventory stock
    if (order.status !== 'Cancelled' && status === 'Cancelled') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
