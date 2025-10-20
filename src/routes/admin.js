const express = require('express');
const router = express.Router();
const {
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/adminController');
const { authenticateAdmin } = require('../middlewares/auth');
const {
  validateLogin,
  validateForgotPassword,
  validateUpdateProfile,
  validateChangePassword
} = require('../middlewares/validation');

// Public routes (no authentication required)
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.get('/profile', authenticateAdmin, getProfile);
router.put('/profile', authenticateAdmin, validateUpdateProfile, updateProfile);
router.put('/change-password', authenticateAdmin, validateChangePassword, changePassword);

module.exports = router;
