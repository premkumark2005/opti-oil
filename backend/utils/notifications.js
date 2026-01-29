import Notification from '../models/Notification.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';

/**
 * Create notification for order approval
 * @param {Object} order - Order object
 */
export const notifyOrderApproved = async (order) => {
  try {
    const message = `Your order #${order.orderNumber} has been approved and is being processed.`;
    
    await Notification.createNotification(
      order.wholesaler,
      message,
      NOTIFICATION_TYPES.ORDER_UPDATE,
      {
        relatedOrder: order._id,
        metadata: {
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: 'approved'
        }
      }
    );
  } catch (error) {
    console.error('Error creating order approval notification:', error);
  }
};

/**
 * Create notification for order rejection
 * @param {Object} order - Order object
 */
export const notifyOrderRejected = async (order) => {
  try {
    const message = `Your order #${order.orderNumber} has been rejected. Reason: ${order.rejectionReason}`;
    
    await Notification.createNotification(
      order.wholesaler,
      message,
      NOTIFICATION_TYPES.ORDER_UPDATE,
      {
        relatedOrder: order._id,
        metadata: {
          orderNumber: order.orderNumber,
          status: 'rejected',
          reason: order.rejectionReason
        }
      }
    );
  } catch (error) {
    console.error('Error creating order rejection notification:', error);
  }
};

/**
 * Create notification for order status update
 * @param {Object} order - Order object
 * @param {String} status - New status
 */
export const notifyOrderStatusUpdate = async (order, status) => {
  try {
    let message = '';
    
    switch (status) {
      case 'processing':
        message = `Your order #${order.orderNumber} is now being processed.`;
        break;
      case 'shipped':
        message = `Your order #${order.orderNumber} has been shipped!`;
        break;
      case 'delivered':
        message = `Your order #${order.orderNumber} has been delivered. Thank you for your business!`;
        break;
      default:
        message = `Your order #${order.orderNumber} status has been updated to ${status}.`;
    }
    
    await Notification.createNotification(
      order.wholesaler,
      message,
      NOTIFICATION_TYPES.ORDER_UPDATE,
      {
        relatedOrder: order._id,
        metadata: {
          orderNumber: order.orderNumber,
          status
        }
      }
    );
  } catch (error) {
    console.error('Error creating order status update notification:', error);
  }
};

/**
 * Create notification for new order (to admin)
 * @param {Object} order - Order object
 * @param {Array} adminUsers - Array of admin user IDs
 */
export const notifyNewOrder = async (order, adminUsers) => {
  try {
    const message = `New order #${order.orderNumber} placed by ${order.wholesaler.name || 'a wholesaler'}. Total: $${order.totalAmount}`;
    
    // Create notification for each admin
    const notifications = adminUsers.map(adminId => 
      Notification.createNotification(
        adminId,
        message,
        NOTIFICATION_TYPES.NEW_ORDER,
        {
          relatedOrder: order._id,
          metadata: {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            wholesalerId: order.wholesaler._id || order.wholesaler
          }
        }
      )
    );
    
    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating new order notification:', error);
  }
};

/**
 * Create notification for order cancellation
 * @param {Object} order - Order object
 */
export const notifyOrderCancelled = async (order) => {
  try {
    const message = `Your order #${order.orderNumber} has been cancelled. ${order.cancellationReason || ''}`;
    
    await Notification.createNotification(
      order.wholesaler,
      message,
      NOTIFICATION_TYPES.ORDER_UPDATE,
      {
        relatedOrder: order._id,
        metadata: {
          orderNumber: order.orderNumber,
          status: 'cancelled',
          reason: order.cancellationReason
        }
      }
    );
  } catch (error) {
    console.error('Error creating order cancellation notification:', error);
  }
};

/**
 * Create low stock alert notification
 * @param {Object} inventory - Inventory object with populated product
 * @param {Array} adminUsers - Array of admin user IDs
 */
export const notifyLowStock = async (inventory, adminUsers) => {
  try {
    const productName = inventory.product?.name || 'Unknown Product';
    const sku = inventory.product?.sku || 'N/A';
    
    const message = `Low stock alert: ${productName} (${sku}) is below reorder level. Available: ${inventory.availableQuantity}, Reorder Level: ${inventory.reorderLevel}`;
    
    // Create notification for each admin
    const notifications = adminUsers.map(adminId => 
      Notification.createNotification(
        adminId,
        message,
        NOTIFICATION_TYPES.LOW_STOCK,
        {
          relatedProduct: inventory.product?._id || inventory.product,
          metadata: {
            productName,
            sku,
            availableQuantity: inventory.availableQuantity,
            reorderLevel: inventory.reorderLevel
          }
        }
      )
    );
    
    await Promise.all(notifications);
    
    // Mark that alert has been sent
    if (!inventory.lowStockAlertSent) {
      inventory.lowStockAlertSent = true;
      await inventory.save();
    }
  } catch (error) {
    console.error('Error creating low stock notification:', error);
  }
};

/**
 * Create notification for wholesaler account approval
 * @param {Object} user - User object
 * @param {Boolean} approved - Whether approved or rejected
 */
export const notifyAccountStatus = async (user, approved) => {
  try {
    let message, type;
    
    if (approved) {
      message = 'Congratulations! Your wholesaler account has been approved. You can now place orders.';
      type = NOTIFICATION_TYPES.ACCOUNT_APPROVED;
    } else {
      message = 'Your wholesaler account application has been reviewed and unfortunately was not approved at this time.';
      type = NOTIFICATION_TYPES.ACCOUNT_REJECTED;
    }
    
    await Notification.createNotification(
      user._id,
      message,
      type,
      {
        metadata: {
          accountStatus: approved ? 'approved' : 'rejected'
        }
      }
    );
  } catch (error) {
    console.error('Error creating account status notification:', error);
  }
};

/**
 * Get all admin user IDs
 */
export const getAdminUserIds = async () => {
  try {
    const User = (await import('../models/User.js')).default;
    const { USER_ROLES } = await import('../config/constants.js');
    
    const admins = await User.find({ role: USER_ROLES.ADMIN }).select('_id');
    return admins.map(admin => admin._id);
  } catch (error) {
    console.error('Error getting admin user IDs:', error);
    return [];
  }
};
