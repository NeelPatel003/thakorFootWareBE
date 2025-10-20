const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Size name is required'],
    unique: true,
    trim: true,
    minlength: [1, 'Size name must be at least 1 character long'],
    maxlength: [50, 'Size name cannot exceed 50 characters']
  },
  sizeCode: {
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
sizeSchema.index({ name: 1 });
sizeSchema.index({ createdBy: 1 });
sizeSchema.index({ sizeCode: 1 }, { sparse: true });
sizeSchema.index({ slug: 1 }, { sparse: true });

// Pre-save middleware to generate sizeCode and slug from name
sizeSchema.pre('save', function(next) {
  if (this.isModified('name') && this.name) {
    // Generate sizeCode from name (uppercase, alphanumeric only)
    this.sizeCode = this.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') // Keep only alphanumeric characters
      .substring(0, 10); // Limit to 10 characters
    
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
sizeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
sizeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Size', sizeSchema);
