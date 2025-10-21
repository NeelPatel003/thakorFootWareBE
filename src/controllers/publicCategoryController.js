const Category = require('../models/Category');

// @desc    Get all categories (Public)
// @route   GET /api/public/categories
// @access  Public
const getPublicCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query)
      .select('name categoryCode slug createdAt') // Only return public fields
      .sort({ name: 1 }) // Sort alphabetically by name
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get public categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving categories'
    });
  }
};

// @desc    Get single category by ID (Public)
// @route   GET /api/public/categories/:id
// @access  Public
const getPublicCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .select('name categoryCode slug createdAt'); // Only return public fields

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Get public category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving category'
    });
  }
};

// @desc    Get single category by slug (Public)
// @route   GET /api/public/categories/slug/:slug
// @access  Public
const getPublicCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .select('name categoryCode slug createdAt'); // Only return public fields

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Get public category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving category'
    });
  }
};

module.exports = {
  getPublicCategories,
  getPublicCategoryById,
  getPublicCategoryBySlug
};
