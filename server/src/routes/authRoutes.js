const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private authenticated customer route
router.get('/me', protect, getMe);

// Private admin check route for verification
router.get('/admin-check', protect, admin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin authorization successful',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

module.exports = router;
