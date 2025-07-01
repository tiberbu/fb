import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

async function seedAdminUser() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🌱 Seeding default admin user...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { username: 'admin' },
        { email: 'useradmin@tiberbu.com' }
      ]
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'useradmin@tiberbu.com',
      password: 'tibs@2025!',
      role: 'Administrator',
      companies: [],
      isActive: true
    });

    await adminUser.save();

    console.log('✅ Default admin user created successfully!');
    console.log('Username: admin');
    console.log('Email: useradmin@tiberbu.com');
    console.log('Password: tibs@2025!');
    console.log('Role: Administrator');
    console.log('');
    console.log('🔐 Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedAdminUser();
