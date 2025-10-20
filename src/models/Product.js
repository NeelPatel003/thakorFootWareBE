const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Product description must be at least 10 characters long'],
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  sizes: [{
    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Size',
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required for each size'],
      min: [0, 'Price cannot be negative']
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required for each size'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model name cannot exceed 100 characters']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [50, 'Color name cannot exceed 50 characters']
  },
  material: {
    type: String,
    trim: true,
    maxlength: [100, 'Material name cannot exceed 100 characters']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  metaKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  seoScore: {
    type: Number,
    min: [0, 'SEO score cannot be negative'],
    max: [100, 'SEO score cannot exceed 100'],
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  wishlistCount: {
    type: Number,
    default: 0,
    min: [0, 'Wishlist count cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isOnSale: 1 });
productSchema.index({ sku: 1 }, { sparse: true });
productSchema.index({ slug: 1 }, { sparse: true });
productSchema.index({ tags: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'sizes.size': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ viewCount: -1 });

// Compound indexes
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, isOnSale: 1 });

// Pre-save middleware to generate SKU and slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name') && this.name) {
    // Generate SKU from name (uppercase, alphanumeric only)
    this.sku = this.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') // Keep only alphanumeric characters
      .substring(0, 20); // Limit to 20 characters
    
    // Generate slug from name
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
  }
  next();
});

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach(image => {
      if (image.isPrimary) {
        primaryCount++;
      }
    });
    
    if (primaryCount === 0) {
      // Set first image as primary if none is set
      this.images[0].isPrimary = true;
    } else if (primaryCount > 1) {
      // Keep only the first primary image
      let foundFirst = false;
      this.images.forEach(image => {
        if (image.isPrimary && !foundFirst) {
          foundFirst = true;
        } else if (image.isPrimary) {
          image.isPrimary = false;
        }
      });
    }
  }
  next();
});

// Virtual for id (MongoDB ObjectId)
productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    const primaryImg = this.images.find(img => img.isPrimary);
    return primaryImg || this.images[0];
  }
  return null;
});

// Virtual for lowest price
productSchema.virtual('lowestPrice').get(function() {
  if (this.sizes && this.sizes.length > 0) {
    const prices = this.sizes
      .filter(size => size.isActive)
      .map(size => size.salePrice || size.price);
    return Math.min(...prices);
  }
  return null;
});

// Virtual for highest price
productSchema.virtual('highestPrice').get(function() {
  if (this.sizes && this.sizes.length > 0) {
    const prices = this.sizes
      .filter(size => size.isActive)
      .map(size => size.salePrice || size.price);
    return Math.max(...prices);
  }
  return null;
});

// Virtual for total stock
productSchema.virtual('totalStock').get(function() {
  if (this.sizes && this.sizes.length > 0) {
    return this.sizes
      .filter(size => size.isActive)
      .reduce((total, size) => total + size.stock, 0);
  }
  return 0;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  return this.totalStock > 0;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Instance method to check if product has specific size
productSchema.methods.hasSize = function(sizeId) {
  return this.sizes.some(size => size.size.toString() === sizeId.toString());
};

// Instance method to get size details
productSchema.methods.getSizeDetails = function(sizeId) {
  return this.sizes.find(size => size.size.toString() === sizeId.toString());
};

// Instance method to update view count
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to update wishlist count
productSchema.methods.updateWishlistCount = function(increment = true) {
  this.wishlistCount += increment ? 1 : -1;
  if (this.wishlistCount < 0) this.wishlistCount = 0;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
