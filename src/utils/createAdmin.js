const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createDefaultAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/footware');
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@footware.com' });
    
    if (existingAdmin) {
      console.log('Default admin already exists');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@footware.com',
      password: 'admin@123', // Change this in production
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
      isActive: true
    });

    await admin.save();
    console.log('Default admin created successfully:');
    console.log('Email: admin@footware.com');
    console.log('Password: admin@123');
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createDefaultAdmin();
