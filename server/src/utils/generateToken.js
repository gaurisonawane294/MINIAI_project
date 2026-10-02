const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for the provided user
 * @param {Object} user - Mongoose User document or user object with _id and role
 * @returns {string} - Signed JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    role: user.role || 'customer',
  };

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_mini_ecommerce_2026_dev';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
