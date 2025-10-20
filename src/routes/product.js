const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  toggleFeaturedStatus,
  getFeaturedProducts,
  getProductsByCategory
} = require('../controllers/productController');
const { authenticateAdmin } = require('../middlewares/auth');
const { validateProduct, validateProductUpdate } = require('../middlewares/validation');

// Public routes (no authentication required)
router.get('/', getAllProducts); // Get all products with filtering and pagination
router.get('/featured', getFeaturedProducts); // Get featured products
router.get('/category/:categoryId', getProductsByCategory); // Get products by category
router.get('/slug/:slug', getProductBySlug); // Get product by slug
router.get('/:id', getProductById); // Get single product by ID

// Protected routes (admin authentication required)
router.post('/', authenticateAdmin, validateProduct, createProduct); // Create new product
router.put('/:id', authenticateAdmin, validateProductUpdate, updateProduct); // Update product
router.delete('/:id', authenticateAdmin, deleteProduct); // Delete product
router.patch('/:id/toggle-status', authenticateAdmin, toggleProductStatus); // Toggle product status
router.patch('/:id/toggle-featured', authenticateAdmin, toggleFeaturedStatus); // Toggle featured status

module.exports = router;
