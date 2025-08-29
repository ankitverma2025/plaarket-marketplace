const express = require('express');
const {
  register,
  login,
  getMe,
  updatePassword,
  logout,
} = require('../controllers/authController');
const { protect } = require('../../../shared/middleware/authMiddleware');
const { validate } = require('../../../shared/utils/validation');
const { registerSchema, loginSchema } = require('../../../shared/utils/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.post('/logout', protect, logout);

module.exports = router;
