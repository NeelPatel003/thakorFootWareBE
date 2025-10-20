const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticateAdmin } = require('../middlewares/auth');
const {
  validateCategory,
  validateCategoryUpdate
} = require('../middlewares/validation');

// All routes require authentication
router.use(authenticateAdmin);

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post('/', validateCategory, createCategory);

// @route   GET /api/categories
// @desc    Get all categories with pagination and search
// @access  Private (Admin only)
router.get('/', getCategories);

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Private (Admin only)
router.get('/:id', getCategoryById);

// @route   PUT /api/categories/:id
// @desc    Update category by ID
// @access  Private (Admin only)
router.put('/:id', validateCategoryUpdate, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category by ID
// @access  Private (Admin only)
router.delete('/:id', deleteCategory);

module.exports = router;
