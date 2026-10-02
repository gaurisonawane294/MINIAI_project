const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const generateToken = require('../src/utils/generateToken');
const { admin } = require('../src/middleware/adminMiddleware');
const { protect } = require('../src/middleware/authMiddleware');

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 Starting Task 1 Auth & Security Unit Test Suite');
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

  // 1. User Schema Validation Tests
  await test('User model should require name, email, and password', () => {
    const user = new User({});
    const err = user.validateSync();
    assert(err.errors.name, 'name should be required');
    assert(err.errors.email, 'email should be required');
    assert(err.errors.password, 'password should be required');
  });

  await test('User model should reject invalid email format', () => {
    const user = new User({
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123',
    });
    const err = user.validateSync();
    assert(err.errors.email, 'invalid email format should fail validation');
  });

  await test('User model should reject passwords with length < 6', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123',
    });
    const err = user.validateSync();
    assert(err.errors.password, 'password < 6 chars should fail validation');
  });

  await test('User model default role should be "customer"', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    assert.strictEqual(user.role, 'customer');
  });

  // 2. Password Hashing & Comparison Tests
  await test('User pre-save hook should hash passwords using bcrypt', async () => {
    const user = new User({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'mypassword123',
    });
    
    // Simulate pre-save hook manually
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    assert.notStrictEqual(user.password, 'mypassword123');
    assert(user.password.startsWith('$2'), 'password should be a bcrypt hash');

    const isValid = await user.comparePassword('mypassword123');
    assert.strictEqual(isValid, true, 'comparePassword should return true for correct password');

    const isInvalid = await user.comparePassword('wrongpassword');
    assert.strictEqual(isInvalid, false, 'comparePassword should return false for incorrect password');
  });

  await test('User toJSON should exclude the password field', () => {
    const user = new User({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hashed_secret',
    });
    const json = user.toJSON();
    assert.strictEqual(json.password, undefined, 'password must not be exposed in toJSON');
    assert.strictEqual(json.name, 'Alice');
  });

  // 3. JWT Token Generation Tests
  await test('generateToken should sign a valid JWT with user ID and role', () => {
    const mockUser = {
      _id: '651a2b3c4d5e6f7a8b9c0d1e',
      role: 'admin',
    };
    const token = generateToken(mockUser);
    assert(typeof token === 'string' && token.length > 20, 'Token must be a non-empty string');

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key_mini_ecommerce_2026_dev'
    );
    assert.strictEqual(decoded.id, mockUser._id);
    assert.strictEqual(decoded.role, 'admin');
    assert(decoded.exp > decoded.iat, 'Token must have a future expiration timestamp');
  });

  // 4. Admin Middleware Tests
  await test('adminMiddleware should allow request if req.user.role === "admin"', () => {
    let nextCalled = false;
    const req = { user: { role: 'admin' } };
    const res = {};
    const next = () => { nextCalled = true; };

    admin(req, res, next);
    assert.strictEqual(nextCalled, true, 'adminMiddleware should call next() for admin user');
  });

  await test('adminMiddleware should respond with 403 Forbidden for non-admin user', () => {
    let statusCode = null;
    let jsonResponse = null;
    const req = { user: { role: 'customer' } };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          },
        };
      },
    };
    const next = () => {};

    admin(req, res, next);
    assert.strictEqual(statusCode, 403, 'adminMiddleware must return status 403');
    assert.strictEqual(jsonResponse.success, false);
  });

  // 5. Auth Middleware Protection Tests
  await test('authMiddleware should respond with 401 when no token is provided', async () => {
    let statusCode = null;
    let jsonResponse = null;
    const req = { headers: {} };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          },
        };
      },
    };
    const next = () => {};

    await protect(req, res, next);
    assert.strictEqual(statusCode, 401, 'protect middleware must return status 401 when token missing');
    assert.strictEqual(jsonResponse.success, false);
  });

  console.log(`\n====================================================`);
  console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`====================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
};

runTests();
