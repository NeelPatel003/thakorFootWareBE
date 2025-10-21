const express = require('express');
const router = express.Router();
const {
  getPublicCategories,
  getPublicCategoryById,
  getPublicCategoryBySlug
} = require('../controllers/publicCategoryController');

// @route   GET /api/public/categories
// @desc    Get all categories (Public access)
// @access  Public
router.get('/', getPublicCategories);

// @route   GET /api/public/categories/:id
// @desc    Get single category by ID (Public access)
// @access  Public
router.get('/:id', getPublicCategoryById);

// @route   GET /api/public/categories/slug/:slug
// @desc    Get single category by slug (Public access)
// @access  Public
router.get('/slug/:slug', getPublicCategoryBySlug);

module.exports = router;
