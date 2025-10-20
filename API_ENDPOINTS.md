# E-Commerce API Endpoints

## Category Endpoints

All category endpoints require admin authentication.

### Create Category
- **POST** `/api/categories`
- **Body**: `{ "name": "Category Name" }`
- **Response**: Created category with id, name, createdBy, updatedBy, createdAt, updatedAt

### Get All Categories
- **GET** `/api/categories`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search by category name
- **Response**: Paginated list of categories with admin details

### Get Category by ID
- **GET** `/api/categories/:id`
- **Response**: Single category with admin details

### Update Category
- **PUT** `/api/categories/:id`
- **Body**: `{ "name": "Updated Category Name" }`
- **Response**: Updated category with admin details

### Delete Category
- **DELETE** `/api/categories/:id`
- **Response**: Success message

## Size Endpoints

All size endpoints require admin authentication.

### Create Size
- **POST** `/api/sizes`
- **Body**: `{ "name": "Size Name" }`
- **Response**: Created size with id, name, createdBy, updatedBy, createdAt, updatedAt

### Get All Sizes
- **GET** `/api/sizes`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search by size name
- **Response**: Paginated list of sizes with admin details

### Get Size by ID
- **GET** `/api/sizes/:id`
- **Response**: Single size with admin details

### Update Size
- **PUT** `/api/sizes/:id`
- **Body**: `{ "name": "Updated Size Name" }`
- **Response**: Updated size with admin details

### Delete Size
- **DELETE** `/api/sizes/:id`
- **Response**: Success message

## Product Endpoints

Product endpoints support both admin and public access.

### Create Product (Admin Only)
- **POST** `/api/products`
- **Body**: 
```json
{
  "name": "Product Name",
  "description": "Detailed product description",
  "shortDescription": "Brief description (optional)",
  "category": "category_id",
  "sizes": [
    {
      "size": "size_id",
      "price": 99.99,
      "salePrice": 79.99,
      "stock": 100,	
      "weight": 1.5,
      "isActive": true
    }
  ],
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "alt": "Product image",
      "isPrimary": true,
      "order": 0
    }
  ],
  "tags": ["tag1", "tag2"],
  "brand": "Brand Name",
  "model": "Model Number",
  "color": "Red",
  "material": "Cotton",
  "dimensions": {
    "length": 10,
    "width": 5,
    "height": 3
  },
  "weight": 2.5,
  "isActive": true,
  "isFeatured": false,
  "isOnSale": true,
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "metaKeywords": ["keyword1", "keyword2"]
}
```
- **Response**: Created product with populated category, sizes, and admin details

### Get All Products (Public)
- **GET** `/api/products`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search by name, description, brand, or tags
  - `category` (optional): Filter by category ID
  - `size` (optional): Filter by size ID
  - `brand` (optional): Filter by brand name
  - `isActive` (optional): Filter by active status
  - `isFeatured` (optional): Filter by featured status
  - `isOnSale` (optional): Filter by sale status
  - `minPrice` (optional): Minimum price filter
  - `maxPrice` (optional): Maximum price filter
  - `sortBy` (optional): Sort field (default: createdAt)
  - `sortOrder` (optional): Sort order (asc/desc, default: desc)
- **Response**: Paginated list of products with category and size details

### Get Product by ID (Public)
- **GET** `/api/products/:id`
- **Response**: Single product with populated category, sizes, and admin details

### Get Product by Slug (Public)
- **GET** `/api/products/slug/:slug`
- **Response**: Single product with populated details (increments view count)

### Update Product (Admin Only)
- **PUT** `/api/products/:id`
- **Body**: Same as create product (all fields optional for updates)
- **Response**: Updated product with populated details

### Delete Product (Admin Only)
- **DELETE** `/api/products/:id`
- **Response**: Success message

### Toggle Product Status (Admin Only)
- **PATCH** `/api/products/:id/toggle-status`
- **Response**: Product with updated active status

### Toggle Featured Status (Admin Only)
- **PATCH** `/api/products/:id/toggle-featured`
- **Response**: Product with updated featured status

### Get Featured Products (Public)
- **GET** `/api/products/featured`
- **Query Parameters**:
  - `limit` (optional): Number of products to return (default: 10)
- **Response**: List of featured products

### Get Products by Category (Public)
- **GET** `/api/products/category/:categoryId`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Sort field (default: createdAt)
  - `sortOrder` (optional): Sort order (asc/desc, default: desc)
- **Response**: Paginated list of products in the specified category

## Model Fields

### Category Model
- `id`: MongoDB ObjectId (auto-generated)
- `name`: String (required, unique, 2-100 characters)
- `categoryCode`: String (auto-generated from name, unique, uppercase, max 15 chars)
- `slug`: String (auto-generated from name, unique, lowercase, URL-friendly)
- `createdBy`: ObjectId reference to Admin
- `updatedBy`: ObjectId reference to Admin
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Size Model
- `id`: MongoDB ObjectId (auto-generated)
- `name`: String (required, unique, 1-50 characters)
- `sizeCode`: String (auto-generated from name, unique, uppercase, max 10 chars)
- `slug`: String (auto-generated from name, unique, lowercase, URL-friendly)
- `createdBy`: ObjectId reference to Admin
- `updatedBy`: ObjectId reference to Admin
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Product Model
- `id`: MongoDB ObjectId (auto-generated)
- `name`: String (required, 2-200 characters)
- `description`: String (required, 10-2000 characters)
- `shortDescription`: String (optional, max 500 characters)
- `sku`: String (auto-generated from name, unique, uppercase, max 20 chars)
- `slug`: String (auto-generated from name, unique, lowercase, URL-friendly)
- `category`: ObjectId reference to Category (required)
- `sizes`: Array of objects with size details:
  - `size`: ObjectId reference to Size (required)
  - `price`: Number (required, positive)
  - `salePrice`: Number (optional, positive, must be less than price)
  - `stock`: Number (required, non-negative, default: 0)
  - `weight`: Number (optional, positive)
  - `isActive`: Boolean (default: true)
- `images`: Array of objects with image details:
  - `url`: String (required)
  - `alt`: String (optional)
  - `isPrimary`: Boolean (default: false)
  - `order`: Number (default: 0)
- `tags`: Array of strings (optional)
- `brand`: String (optional, max 100 characters)
- `model`: String (optional, max 100 characters)
- `color`: String (optional, max 50 characters)
- `material`: String (optional, max 100 characters)
- `dimensions`: Object (optional):
  - `length`: Number (positive)
  - `width`: Number (positive)
  - `height`: Number (positive)
- `weight`: Number (optional, positive)
- `isActive`: Boolean (default: true)
- `isFeatured`: Boolean (default: false)
- `isOnSale`: Boolean (default: false)
- `metaTitle`: String (optional, max 60 characters)
- `metaDescription`: String (optional, max 160 characters)
- `metaKeywords`: Array of strings (optional)
- `seoScore`: Number (0-100, default: 0)
- `viewCount`: Number (default: 0, non-negative)
- `wishlistCount`: Number (default: 0, non-negative)
- `createdBy`: ObjectId reference to Admin (required)
- `updatedBy`: ObjectId reference to Admin
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Product Virtual Fields
- `primaryImage`: Returns the primary image or first image
- `lowestPrice`: Returns the lowest price among all active sizes
- `highestPrice`: Returns the highest price among all active sizes
- `totalStock`: Returns the sum of stock for all active sizes
- `inStock`: Boolean indicating if product has any stock

## Authentication

Admin-only endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Public endpoints (GET requests for products) do not require authentication.

## Validation Rules

### Category Name
- Required for creation
- Optional for updates
- 2-100 characters
- Only letters, numbers, spaces, hyphens, underscores, and ampersands allowed
- Must be unique

### Size Name
- Required for creation
- Optional for updates
- 1-50 characters
- Only letters, numbers, spaces, hyphens, underscores, and ampersands allowed
- Must be unique

### Product Fields
- **name**: Required for creation, optional for updates, 2-200 characters
- **description**: Required for creation, optional for updates, 10-2000 characters
- **shortDescription**: Optional, max 500 characters
- **category**: Required for creation, must be valid category ID
- **sizes**: Required for creation, array with at least one size object:
  - **size**: Required, must be valid size ID
  - **price**: Required, must be positive number
  - **salePrice**: Optional, must be positive number and less than price
  - **stock**: Required, must be non-negative number
- **images**: Optional, array of image objects
- **tags**: Optional, array of strings
- **brand**: Optional, max 100 characters
- **model**: Optional, max 100 characters
- **color**: Optional, max 50 characters
- **material**: Optional, max 100 characters
- **weight**: Optional, must be positive number
- **isActive**: Optional, boolean value
- **isFeatured**: Optional, boolean value
- **isOnSale**: Optional, boolean value
- **metaTitle**: Optional, max 60 characters
- **metaDescription**: Optional, max 160 characters
- **metaKeywords**: Optional, array of strings

## Future Enhancements

The product system is designed to support future e-commerce features:

### Product Reviews & Ratings
- Customer reviews and ratings system
- Review moderation and approval workflow
- Average rating calculations
- Review helpfulness voting

### Inventory Management
- Stock level tracking
- Low stock alerts
- Inventory history and tracking
- Multi-warehouse support

### Product Variants
- Color, size, and material variants
- Variant-specific pricing and inventory
- Variant images and descriptions

### Advanced Features
- Product comparison
- Wishlist and favorites
- Recently viewed products
- Related products recommendations
- Product bundles and packages
- Discount and promotion system
- SEO optimization tools
- Analytics and reporting
