import mongoose from 'mongoose';
import { RAW_MATERIAL_ORDER_STATUS } from '../config/constants.js';

const rawMaterialOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true
    },
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: [true, 'Raw material is required']
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier is required']
    },
    quantityOrdered: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative']
    },
    totalPrice: {
      type: Number
    },
    status: {
      type: String,
      enum: {
        values: Object.values(RAW_MATERIAL_ORDER_STATUS),
        message: 'Invalid status'
      },
      default: RAW_MATERIAL_ORDER_STATUS.PENDING
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    deliveryDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    placedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
rawMaterialOrderSchema.index({ supplier: 1, status: 1 });
rawMaterialOrderSchema.index({ orderNumber: 1 });
rawMaterialOrderSchema.index({ orderDate: -1 });

// Pre-save hook to generate order number
rawMaterialOrderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('RawMaterialOrder').countDocuments();
    this.orderNumber = `RMO-${Date.now()}-${count + 1}`;
  }
  
  // Calculate total price
  this.totalPrice = this.quantityOrdered * this.pricePerUnit;
  
  next();
});

// Virtual for raw material details
rawMaterialOrderSchema.virtual('rawMaterialDetails', {
  ref: 'RawMaterial',
  localField: 'rawMaterial',
  foreignField: '_id',
  justOne: true
});

// Virtual for supplier details
rawMaterialOrderSchema.virtual('supplierDetails', {
  ref: 'User',
  localField: 'supplier',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
rawMaterialOrderSchema.set('toJSON', { virtuals: true });
rawMaterialOrderSchema.set('toObject', { virtuals: true });

const RawMaterialOrder = mongoose.model('RawMaterialOrder', rawMaterialOrderSchema);

export default RawMaterialOrder;
