import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  productName: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    wholesaler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wholesaler reference is required']
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function(items) {
          return items && items.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    orderStatus: {
      type: String,
      required: true,
      enum: {
        values: Object.values(ORDER_STATUS),
        message: 'Invalid order status'
      },
      default: ORDER_STATUS.PENDING
    },
    paymentStatus: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_STATUS),
        message: 'Invalid payment status'
      },
      default: PAYMENT_STATUS.PENDING
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    fulfilledAt: {
      type: Date
    },
    shippedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ wholesaler: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

// Virtual field for total items count
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

/**
 * Generate unique order number
 */
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the count of orders for today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const count = await mongoose.model('Order').countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${sequence}`;
  }
  next();
});

/**
 * Calculate subtotals and total before save
 */
orderSchema.pre('save', function (next) {
  // Calculate subtotal for each item
  this.items.forEach(item => {
    item.subtotal = item.quantity * item.unitPrice;
  });
  
  // Calculate total amount
  this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
  
  next();
});

/**
 * Method to check if order can be modified
 */
orderSchema.methods.canBeModified = function () {
  return [ORDER_STATUS.PENDING].includes(this.orderStatus);
};

/**
 * Method to check if order can be cancelled
 */
orderSchema.methods.canBeCancelled = function () {
  return [ORDER_STATUS.PENDING, ORDER_STATUS.APPROVED].includes(this.orderStatus);
};

/**
 * Method to approve order
 */
orderSchema.methods.approve = function (adminId) {
  if (this.orderStatus !== ORDER_STATUS.PENDING) {
    throw new Error('Only pending orders can be approved');
  }
  this.orderStatus = ORDER_STATUS.APPROVED;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this;
};

/**
 * Method to reject order
 */
orderSchema.methods.reject = function (adminId, reason) {
  if (this.orderStatus !== ORDER_STATUS.PENDING) {
    throw new Error('Only pending orders can be rejected');
  }
  this.orderStatus = ORDER_STATUS.REJECTED;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this;
};

/**
 * Method to mark as processing
 */
orderSchema.methods.markAsProcessing = function () {
  if (this.orderStatus !== ORDER_STATUS.APPROVED) {
    throw new Error('Only approved orders can be processed');
  }
  this.orderStatus = ORDER_STATUS.PROCESSING;
  return this;
};

/**
 * Method to mark as shipped
 */
orderSchema.methods.markAsShipped = function () {
  if (![ORDER_STATUS.APPROVED, ORDER_STATUS.PROCESSING].includes(this.orderStatus)) {
    throw new Error('Only approved or processing orders can be shipped');
  }
  this.orderStatus = ORDER_STATUS.SHIPPED;
  this.shippedAt = new Date();
  return this;
};

/**
 * Method to mark as delivered
 */
orderSchema.methods.markAsDelivered = function () {
  if (this.orderStatus !== ORDER_STATUS.SHIPPED) {
    throw new Error('Only shipped orders can be marked as delivered');
  }
  this.orderStatus = ORDER_STATUS.DELIVERED;
  this.deliveredAt = new Date();
  this.fulfilledAt = new Date();
  return this;
};

/**
 * Method to cancel order
 */
orderSchema.methods.cancel = function (reason) {
  if (!this.canBeCancelled()) {
    throw new Error('This order cannot be cancelled');
  }
  this.orderStatus = ORDER_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
