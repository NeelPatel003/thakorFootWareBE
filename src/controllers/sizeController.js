const Size = require('../models/Size');

// @desc    Create a new size
// @route   POST /api/sizes
// @access  Private (Admin only)
const createSize = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.admin._id;

    // Check if size already exists
    const existingSize = await Size.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    
    if (existingSize) {
      return res.status(400).json({
        success: false,
        message: 'Size with this name already exists'
      });
    }

    const size = new Size({
      name,
      createdBy
    });

    await size.save();

    res.status(201).json({
      success: true,
      message: 'Size created successfully',
      data: {
        size
      }
    });

  } catch (error) {
    console.error('Create size error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating size'
    });
  }
};

// @desc    Get all sizes
// @route   GET /api/sizes
// @access  Private (Admin only)
const getSizes = async (req, res) => {
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

    const sizes = await Size.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Size.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Sizes retrieved successfully',
      data: {
        sizes,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get sizes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving sizes'
    });
  }
};

// @desc    Get single size by ID
// @route   GET /api/sizes/:id
// @access  Private (Admin only)
const getSizeById = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Size retrieved successfully',
      data: {
        size
      }
    });

  } catch (error) {
    console.error('Get size by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving size'
    });
  }
};

// @desc    Update size by ID
// @route   PUT /api/sizes/:id
// @access  Private (Admin only)
const updateSize = async (req, res) => {
  try {
    const { name } = req.body;
    const updatedBy = req.admin._id;

    // Check if size exists
    const size = await Size.findById(req.params.id);
    
    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    // Check if new name already exists (excluding current size)
    if (name && name !== size.name) {
      const existingSize = await Size.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingSize) {
        return res.status(400).json({
          success: false,
          message: 'Size with this name already exists'
        });
      }
    }

    // Update size
    const updateData = { updatedBy };
    if (name) updateData.name = name;

    const updatedSize = await Size.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('updatedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Size updated successfully',
      data: {
        size: updatedSize
      }
    });

  } catch (error) {
    console.error('Update size error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating size'
    });
  }
};

// @desc    Delete size by ID
// @route   DELETE /api/sizes/:id
// @access  Private (Admin only)
const deleteSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    
    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    await Size.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Size deleted successfully'
    });

  } catch (error) {
    console.error('Delete size error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting size'
    });
  }
};

module.exports = {
  createSize,
  getSizes,
  getSizeById,
  updateSize,
  deleteSize
};
