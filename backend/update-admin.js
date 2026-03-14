import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user and update
    const result = await User.findOneAndUpdate(
      { role: 'admin' },
      { 
        name: 'Ravi',
        businessName: 'Ravi Oil Mills'
      },
      { new: true }
    );

    if (result) {
      console.log('✅ Admin updated successfully:');
      console.log(`   Name: ${result.name}`);
      console.log(`   Business Name: ${result.businessName}`);
      console.log(`   Email: ${result.email}`);
    } else {
      console.log('❌ No admin user found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateAdmin();
