import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

/**
 * Seed Admin User
 * Creates an initial admin account for first-time setup
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@optioil.com' });
    
    if (adminExists) {
      console.log('ℹ️  Admin user already exists');
      console.log('   Email: admin@optioil.com');
      console.log('   You can use this account to login');
      process.exit(0);
    }

    // Create admin user (password will be hashed by the model's pre-save hook)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@optioil.com',
      password: 'Admin@123', // Plain password - model will hash it
      role: 'admin',
      isActive: true
    });

    console.log('\n🎉 Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@optioil.com');
    console.log('🔑 Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change the password after first login!\n');
    console.log('You can now login at: http://localhost:5173/login\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();
