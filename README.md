# Footware Backend API

A Node.js/Express backend API for admin management with authentication and profile management features.

## Features

- **Admin Authentication**: Login with email and password
- **Manual Forgot Password**: Generate reset tokens for password recovery
- **Profile Management**: Get and update admin profile information
- **Password Management**: Change password with current password verification
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against brute force attacks
- **Security**: Helmet for security headers, CORS configuration

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/forgot-password` - Generate password reset token
- `POST /api/admin/reset-password` - Reset password using token

### Profile Management (Protected)
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `PUT /api/admin/change-password` - Change password

### Health Check
- `GET /health` - Server health check

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/footware
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
```

3. Start MongoDB (make sure MongoDB is running on your system)

4. Create default admin user:
```bash
node src/utils/createAdmin.js
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@footware.com",
    "password": "Admin123!"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name",
    "lastName": "Updated Last Name",
    "phone": "+1234567890"
  }'
```

### Forgot Password
```bash
curl -X POST http://localhost:3000/api/admin/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@footware.com"
  }'
```

### Reset Password
```bash
curl -X POST http://localhost:3000/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "RESET_TOKEN_FROM_FORGOT_PASSWORD",
    "newPassword": "NewPassword123!"
  }'
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation and sanitization
- CORS protection
- Security headers with Helmet
- Password strength requirements

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/footware |
| JWT_SECRET | JWT signing secret | your-super-secret-jwt-key-change-this-in-production |
| JWT_EXPIRE | JWT expiration time | 7d |
| BCRYPT_ROUNDS | Bcrypt salt rounds | 12 |

## Default Admin Credentials

- **Email**: admin@footware.com
- **Password**: Admin123!

**Important**: Change the default password after first login in production!

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional array of validation errors
}
```

## Development

- Uses nodemon for development auto-restart
- Comprehensive error handling
- Input validation with express-validator
- MongoDB with Mongoose ODM
