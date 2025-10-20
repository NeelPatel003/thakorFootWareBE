const Product = require('../models/Product');
const Category = require('../models/Category');
const Size = require('../models/Size');
const mongoose = require('mongoose');

// Get all products with pagination, filtering, and sorting
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      size,
      brand,
      isActive,
      isFeatured,
      isOnSale,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }

    // Size filter
    if (size) {
      if (mongoose.Types.ObjectId.isValid(size)) {
        filter['sizes.size'] = size;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid size ID'
        });
      }
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Status filters
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }

    if (isOnSale !== undefined) {
      filter.isOnSale = isOnSale === 'true';
    }

    // Price filters
    if (minPrice || maxPrice) {
      filter.$or = filter.$or || [];
      const priceConditions = [];

      if (minPrice) {
        priceConditions.push({
          $or: [
            { 'sizes.price': { $gte: parseFloat(minPrice) } },
            { 'sizes.salePrice': { $gte: parseFloat(minPrice) } }
          ]
        });
      }

      if (maxPrice) {
        priceConditions.push({
          $or: [
            { 'sizes.price': { $lte: parseFloat(maxPrice) } },
            { 'sizes.salePrice': { $lte: parseFloat(maxPrice) } }
          ]
        });
      }

      if (priceConditions.length > 0) {
        filter.$and = priceConditions;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const products = await Product.find(filter)
      .populate('category', 'name slug categoryCode')
      .populate('sizes.size', 'name sizeCode slug')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: error.message
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name slug categoryCode')
      .populate('sizes.size', 'name sizeCode slug')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });

  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: error.message
    });
  }
};

// Get product by slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate('category', 'name slug categoryCode')
      .populate('sizes.size', 'name sizeCode slug')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementViewCount();

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });

  } catch (error) {
    console.error('Error in getProductBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: error.message
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      sizes,
      images,
      tags,
      brand,
      model,
      color,
      material,
      dimensions,
      weight,
      isActive = true,
      isFeatured = false,
      isOnSale = false,
      metaTitle,
      metaDescription,
      metaKeywords
    } = req.body;

    // Validate category exists
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Validate sizes exist and have required fields
    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one size is required'
      });
    }

    for (const sizeData of sizes) {
      if (!mongoose.Types.ObjectId.isValid(sizeData.size)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid size ID in sizes array'
        });
      }

      const sizeExists = await Size.findById(sizeData.size);
      if (!sizeExists) {
        return res.status(400).json({
          success: false,
          message: `Size with ID ${sizeData.size} not found`
        });
      }

      if (!sizeData.price || sizeData.price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid price is required for each size'
        });
      }

      if (sizeData.salePrice && sizeData.salePrice >= sizeData.price) {
        return res.status(400).json({
          success: false,
          message: 'Sale price must be less than regular price'
        });
      }
    }

    // Create product data
    const productData = {
      name,
      description,
      shortDescription,
      category,
      sizes,
      images: images || [],
      tags: tags || [],
      brand,
      model,
      color,
      material,
      dimensions,
      weight,
      isActive,
      isFeatured,
      isOnSale,
      metaTitle,
      metaDescription,
      metaKeywords: metaKeywords || [],
      createdBy: req.admin.id
    };

    const product = new Product(productData);
    await product.save();

    // Populate the created product
    await product.populate([
      { path: 'category', select: 'name slug categoryCode' },
      { path: 'sizes.size', select: 'name sizeCode slug' },
      { path: 'createdBy', select: 'username firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Error in createProduct:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate category if provided
    if (updateData.category) {
      if (!mongoose.Types.ObjectId.isValid(updateData.category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }

      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Validate sizes if provided
    if (updateData.sizes) {
      if (!Array.isArray(updateData.sizes) || updateData.sizes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one size is required'
        });
      }

      for (const sizeData of updateData.sizes) {
        if (!mongoose.Types.ObjectId.isValid(sizeData.size)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid size ID in sizes array'
          });
        }

        const sizeExists = await Size.findById(sizeData.size);
        if (!sizeExists) {
          return res.status(400).json({
            success: false,
            message: `Size with ID ${sizeData.size} not found`
          });
        }

        if (!sizeData.price || sizeData.price < 0) {
          return res.status(400).json({
            success: false,
            message: 'Valid price is required for each size'
          });
        }

        if (sizeData.salePrice && sizeData.salePrice >= sizeData.price) {
          return res.status(400).json({
            success: false,
            message: 'Sale price must be less than regular price'
          });
        }
      }
    }

    // Add updatedBy field
    updateData.updatedBy = req.admin.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'category', select: 'name slug categoryCode' },
      { path: 'sizes.size', select: 'name sizeCode slug' },
      { path: 'createdBy', select: 'username firstName lastName' },
      { path: 'updatedBy', select: 'username firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error in updateProduct:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Toggle product status (active/inactive)
const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    product.updatedBy = req.admin.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: product._id,
        isActive: product.isActive
      }
    });

  } catch (error) {
    console.error('Error in toggleProductStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling product status',
      error: error.message
    });
  }
};

// Toggle featured status
const toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isFeatured = !product.isFeatured;
    product.updatedBy = req.admin.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        id: product._id,
        isFeatured: product.isFeatured
      }
    });

  } catch (error) {
    console.error('Error in toggleFeaturedStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling featured status',
      error: error.message
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('category', 'name slug categoryCode')
      .populate('sizes.size', 'name sizeCode slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: products
    });

  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving featured products',
      error: error.message
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const filter = { 
      category: categoryId, 
      isActive: true 
    };

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('category', 'name slug categoryCode')
      .populate('sizes.size', 'name sizeCode slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Products by category retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          limit: parseInt(limit)
        },
        category: categoryExists
      }
    });

  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products by category',
      error: error.message
    });
  }
};

module.exports = {
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
};
