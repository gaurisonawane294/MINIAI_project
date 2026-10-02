/**
 * Admin Authorization Middleware:
 * Verifies that the authenticated user possesses the 'admin' role.
 * Must be executed AFTER protect (authMiddleware).
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrator privileges required',
  });
};

module.exports = { admin };
