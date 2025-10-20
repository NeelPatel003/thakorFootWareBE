const express = require('express');
const router = express.Router();
const {
  createSize,
  getSizes,
  getSizeById,
  updateSize,
  deleteSize
} = require('../controllers/sizeController');
const { authenticateAdmin } = require('../middlewares/auth');
const {
  validateSize,
  validateSizeUpdate
} = require('../middlewares/validation');

// All routes require authentication
router.use(authenticateAdmin);

// @route   POST /api/sizes
// @desc    Create a new size
// @access  Private (Admin only)
router.post('/', validateSize, createSize);

// @route   GET /api/sizes
// @desc    Get all sizes with pagination and search
// @access  Private (Admin only)
router.get('/', getSizes);

// @route   GET /api/sizes/:id
// @desc    Get single size by ID
// @access  Private (Admin only)
router.get('/:id', getSizeById);

// @route   PUT /api/sizes/:id
// @desc    Update size by ID
// @access  Private (Admin only)
router.put('/:id', validateSizeUpdate, updateSize);

// @route   DELETE /api/sizes/:id
// @desc    Delete size by ID
// @access  Private (Admin only)
router.delete('/:id', deleteSize);

module.exports = router;
