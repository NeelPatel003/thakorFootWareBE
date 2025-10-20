const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Forgot password validation rules
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors
];

// Update profile validation rules
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Change password validation rules
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  handleValidationErrors
];

// Category validation rules
const validateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&]+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands'),
  handleValidationErrors
];

const validateCategoryUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&]+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands'),
  handleValidationErrors
];

// Size validation rules
const validateSize = [
  body('name')
    .notEmpty()
    .withMessage('Size name is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Size name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_&]+$/)
    .withMessage('Size name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands'),
  handleValidationErrors
];

const validateSizeUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Size name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_&]+$/)
    .withMessage('Size name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands'),
  handleValidationErrors
];

// Product validation rules
const validateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Product description is required')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('sizes')
    .isArray({ min: 1 })
    .withMessage('At least one size is required')
    .custom((sizes) => {
      for (const size of sizes) {
        if (!size.size || !size.price) {
          throw new Error('Each size must have size ID and price');
        }
        if (typeof size.price !== 'number' || size.price < 0) {
          throw new Error('Price must be a positive number');
        }
        if (size.salePrice && (typeof size.salePrice !== 'number' || size.salePrice < 0)) {
          throw new Error('Sale price must be a positive number');
        }
        if (size.salePrice && size.salePrice >= size.price) {
          throw new Error('Sale price must be less than regular price');
        }
        if (typeof size.stock !== 'number' || size.stock < 0) {
          throw new Error('Stock must be a non-negative number');
        }
      }
      return true;
    }),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model name cannot exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Color name cannot exceed 50 characters'),
  body('material')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Material name cannot exceed 100 characters'),
  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Weight cannot be negative');
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean value'),
  body('isOnSale')
    .optional()
    .isBoolean()
    .withMessage('isOnSale must be a boolean value'),
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),
  body('metaKeywords')
    .optional()
    .isArray()
    .withMessage('Meta keywords must be an array'),
  handleValidationErrors
];

const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('sizes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one size is required')
    .custom((sizes) => {
      for (const size of sizes) {
        if (!size.size || !size.price) {
          throw new Error('Each size must have size ID and price');
        }
        if (typeof size.price !== 'number' || size.price < 0) {
          throw new Error('Price must be a positive number');
        }
        if (size.salePrice && (typeof size.salePrice !== 'number' || size.salePrice < 0)) {
          throw new Error('Sale price must be a positive number');
        }
        if (size.salePrice && size.salePrice >= size.price) {
          throw new Error('Sale price must be less than regular price');
        }
        if (typeof size.stock !== 'number' || size.stock < 0) {
          throw new Error('Stock must be a non-negative number');
        }
      }
      return true;
    }),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model name cannot exceed 100 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Color name cannot exceed 50 characters'),
  body('material')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Material name cannot exceed 100 characters'),
  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Weight cannot be negative');
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean value'),
  body('isOnSale')
    .optional()
    .isBoolean()
    .withMessage('isOnSale must be a boolean value'),
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),
  body('metaKeywords')
    .optional()
    .isArray()
    .withMessage('Meta keywords must be an array'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateForgotPassword,
  validateUpdateProfile,
  validateChangePassword,
  validateCategory,
  validateCategoryUpdate,
  validateSize,
  validateSizeUpdate,
  validateProduct,
  validateProductUpdate
};
