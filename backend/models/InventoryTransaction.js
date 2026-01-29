import mongoose from 'mongoose';
import { TRANSACTION_TYPES } from '../config/constants.js';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: Object.values(TRANSACTION_TYPES),
        message: 'Invalid transaction type'
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    referenceNumber: {
      type: String,
      trim: true
    },
    unitCost: {
      type: Number,
      min: [0, 'Unit cost cannot be negative']
    },
    totalCost: {
      type: Number,
      min: [0, 'Total cost cannot be negative']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
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
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
inventoryTransactionSchema.index({ product: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1 });
inventoryTransactionSchema.index({ supplier: 1 });
inventoryTransactionSchema.index({ order: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });

/**
 * Calculate total cost before save
 */
inventoryTransactionSchema.pre('save', function (next) {
  if (this.unitCost && this.quantity) {
    this.totalCost = this.unitCost * this.quantity;
  }
  next();
});

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;
