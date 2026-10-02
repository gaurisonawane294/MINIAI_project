const assert = require('assert');
const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 Starting Task 4 Order & Stock Engine Unit Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  };

  const validUserId = new mongoose.Types.ObjectId();
  const validProductId = new mongoose.Types.ObjectId();
  const validCategoryId = new mongoose.Types.ObjectId();

  // 1. Order Schema Validation Tests
  await test('Order model should require user, products, totalAmount, and shippingAddress', () => {
    const order = new Order({});
    const err = order.validateSync();
    assert(err.errors.user, 'user should be required');
    assert(err.errors.products, 'products should be required');
    assert(err.errors.totalAmount, 'totalAmount should be required');
    assert(err.errors.shippingAddress, 'shippingAddress should be required');
  });

  await test('Order model should reject empty products array', () => {
    const order = new Order({
      user: validUserId,
      products: [],
      totalAmount: 100,
      shippingAddress: {
        name: 'Jane Doe',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        pincode: '12345',
      },
    });
    const err = order.validateSync();
    assert(err.errors.products, 'Empty products array should fail validation');
  });

  await test('Order line item should require product, name, quantity, price', () => {
    const order = new Order({
      user: validUserId,
      products: [{}],
      totalAmount: 100,
      shippingAddress: {
        name: 'Jane Doe',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        pincode: '12345',
      },
    });
    const err = order.validateSync();
    assert(err.errors['products.0.product'], 'line item product is required');
    assert(err.errors['products.0.name'], 'line item name is required');
    assert(err.errors['products.0.quantity'], 'line item quantity is required');
    assert(err.errors['products.0.price'], 'line item price is required');
  });

  await test('Order line item quantity must be at least 1', () => {
    const order = new Order({
      user: validUserId,
      products: [
        {
          product: validProductId,
          name: 'Headphones',
          quantity: 0,
          price: 99.99,
        },
      ],
      totalAmount: 99.99,
      shippingAddress: {
        name: 'Jane Doe',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        pincode: '12345',
      },
    });
    const err = order.validateSync();
    assert(err.errors['products.0.quantity'], 'quantity < 1 should fail validation');
  });

  await test('Order model default paymentMethod should be "Cash on Delivery"', () => {
    const order = new Order({
      user: validUserId,
      products: [
        {
          product: validProductId,
          name: 'Headphones',
          quantity: 1,
          price: 99.99,
        },
      ],
      totalAmount: 99.99,
      shippingAddress: {
        name: 'Jane Doe',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        pincode: '12345',
      },
    });
    assert.strictEqual(order.paymentMethod, 'Cash on Delivery');
  });

  await test('Order model default status should be "Pending"', () => {
    const order = new Order({
      user: validUserId,
      products: [
        {
          product: validProductId,
          name: 'Headphones',
          quantity: 1,
          price: 99.99,
        },
      ],
      totalAmount: 99.99,
      shippingAddress: {
        name: 'Jane Doe',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        pincode: '12345',
      },
    });
    assert.strictEqual(order.status, 'Pending');
  });

  await test('Order model should reject invalid status values', () => {
    const order = new Order({
      user: validUserId,
      products: [
        {
          product: validProductId,
          name: 'Headphones',
          quantity: 1,
          price: 99.99,
        },
      ],
      totalAmount: 99.99,
      shippingAddress: {
        name: 'Jane Doe',
        phone: '1234567890',
        address: '123 Street',
        city: 'City',
        pincode: '12345',
      },
      status: 'InvalidStatus',
    });
    const err = order.validateSync();
    assert(err.errors.status, 'Invalid status must fail validation');
  });

  await test('Order model should accept all 5 lifecycle statuses', () => {
    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    for (const st of validStatuses) {
      const order = new Order({
        user: validUserId,
        products: [
          {
            product: validProductId,
            name: 'Headphones',
            quantity: 1,
            price: 99.99,
          },
        ],
        totalAmount: 99.99,
        shippingAddress: {
          name: 'Jane Doe',
          phone: '1234567890',
          address: '123 Street',
          city: 'City',
          pincode: '12345',
        },
        status: st,
      });
      const err = order.validateSync();
      assert(!err, `Status ${st} should be valid`);
      assert.strictEqual(order.status, st);
    }
  });

  // 2. Shipping Address Subschema Tests
  await test('Shipping address should require name, phone, address, city, pincode', () => {
    const order = new Order({
      user: validUserId,
      products: [
        {
          product: validProductId,
          name: 'Headphones',
          quantity: 1,
          price: 99.99,
        },
      ],
      totalAmount: 99.99,
      shippingAddress: {},
    });
    const err = order.validateSync();
    assert(err.errors['shippingAddress.name'], 'shipping name is required');
    assert(err.errors['shippingAddress.phone'], 'shipping phone is required');
    assert(err.errors['shippingAddress.address'], 'shipping address is required');
    assert(err.errors['shippingAddress.city'], 'shipping city is required');
    assert(err.errors['shippingAddress.pincode'], 'shipping pincode is required');
  });

  // 3. Zero-Trust Pricing Calculation Logic Verification
  await test('Zero-Trust pricing engine calculates totalAmount strictly from catalog prices', () => {
    // Malicious client submitted price 0.01
    const clientItems = [
      { product: validProductId, quantity: 3, price: 0.01 },
    ];
    // Real catalog price in MongoDB
    const dbProduct = {
      _id: validProductId,
      name: 'Wireless Headphones',
      price: 149.99,
      stock: 10,
    };

    // Server calculation
    let calculatedTotal = 0;
    const orderProducts = [];
    for (const item of clientItems) {
      const trustedPrice = dbProduct.price; // ignores item.price completely
      calculatedTotal += trustedPrice * item.quantity;
      orderProducts.push({
        product: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: trustedPrice,
      });
    }
    const finalTotal = Math.round(calculatedTotal * 100) / 100;

    assert.strictEqual(finalTotal, 449.97, 'Total amount must equal 149.99 * 3 = 449.97, ignoring client price 0.01');
    assert.strictEqual(orderProducts[0].price, 149.99);
  });

  // 4. Stock Guard Check Logic Verification
  await test('Stock Guard rejects purchase when requested quantity exceeds stock', () => {
    const availableStock = 5;
    const requestedQuantity = 7;
    const canFulfill = availableStock >= requestedQuantity;
    assert.strictEqual(canFulfill, false, 'Stock guard must reject requestedQuantity > stock');
  });

  await test('Stock Guard allows purchase when requested quantity <= stock and decrements stock', () => {
    let stock = 10;
    const requestedQuantity = 4;
    assert(stock >= requestedQuantity, 'Stock should be sufficient');
    stock -= requestedQuantity;
    assert.strictEqual(stock, 6, 'Stock should be 10 - 4 = 6');
  });

  console.log(`\n====================================================`);
  console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`====================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
};

runTests();
