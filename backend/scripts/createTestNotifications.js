import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

dotenv.config();

/**
 * Create Test Notifications
 * Creates sample notifications for testing the notification system
 */
const createTestNotifications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@optioil.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found. Please run seedAdmin.js first.');
      process.exit(1);
    }

    // Sample notifications (using valid types from constants.js)
    const notifications = [
      {
        user: admin._id,
        type: 'new-order',
        message: 'New order #ORD-001 has been placed by XYZ Wholesalers. Awaiting approval.',
        isRead: false
      },
      {
        user: admin._id,
        type: 'low-stock',
        message: 'Sunflower Oil (1L) is running low. Current stock: 15 units. Reorder level: 50 units.',
        isRead: false
      },
      {
        user: admin._id,
        type: 'account-approved',
        message: 'ABC Trading Company wholesaler account has been approved successfully.',
        isRead: false
      },
      {
        user: admin._id,
        type: 'order-update',
        message: 'Order #ORD-002 has been shipped and is on the way to the delivery address.',
        isRead: true
      },
      {
        user: admin._id,
        type: 'low-stock',
        message: 'Coconut Oil (500ml) stock is below reorder level. Please restock soon.',
        isRead: true
      },
      {
        user: admin._id,
        type: 'new-order',
        message: 'New order #ORD-003 received from DEF Wholesalers for 50 units of Olive Oil.',
        isRead: false
      },
      {
        user: admin._id,
        type: 'order-update',
        message: 'Order #ORD-004 has been delivered successfully to customer.',
        isRead: false
      },
      {
        user: admin._id,
        type: 'account-rejected',
        message: 'XYZ Enterprises wholesaler application has been rejected due to incomplete documents.',
        isRead: true
      }
    ];

    // Clear existing notifications for admin (optional)
    await Notification.deleteMany({ user: admin._id });
    console.log('🗑️  Cleared existing notifications');

    // Create new notifications
    const created = await Notification.insertMany(notifications);
    
    console.log('\n🎉 Test notifications created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total notifications: ${created.length}`);
    console.log(`✉️  Unread notifications: ${notifications.filter(n => !n.isRead).length}`);
    console.log(`✅ Read notifications: ${notifications.filter(n => n.isRead).length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Notifications by type:');
    notifications.forEach(n => {
      const preview = n.message.substring(0, 50) + (n.message.length > 50 ? '...' : '');
      console.log(`   ${n.isRead ? '✓' : '•'} [${n.type.toUpperCase()}] ${preview}`);
    });
    console.log('\n✨ You can now test the notification system!');
    console.log('   Login at: http://localhost:3000/login');
    console.log('   Email: admin@optioil.com');
    console.log('   Password: Admin@123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test notifications:', error.message);
    process.exit(1);
  }
};

// Run the script
createTestNotifications();
