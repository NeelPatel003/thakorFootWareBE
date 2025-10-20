const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  categoryCode: {
    type: String,
    unique: true,
    sparse: true, // This allows multiple null values but ensures uniqueness for non-null values
    trim: true,
    uppercase: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true, // This allows multiple null values but ensures uniqueness for non-null values
    trim: true,
    lowercase: true
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
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ createdBy: 1 });
categorySchema.index({ categoryCode: 1 }, { sparse: true });
categorySchema.index({ slug: 1 }, { sparse: true });

// Pre-save middleware to generate categoryCode and slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && this.name) {
    // Generate categoryCode from name (uppercase, alphanumeric only)
    this.categoryCode = this.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') // Keep only alphanumeric characters
      .substring(0, 15); // Limit to 15 characters
    
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

// Virtual for id (MongoDB ObjectId)
categorySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Category', categorySchema);
