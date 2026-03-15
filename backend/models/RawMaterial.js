import mongoose from 'mongoose';
import { RAW_MATERIAL_CATEGORIES, RAW_MATERIAL_UNITS } from '../config/constants.js';

const rawMaterialSchema = new mongoose.Schema(
  {
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      trim: true
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name for material is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    category: {
      type: String,
      enum: {
        values: Object.values(RAW_MATERIAL_CATEGORIES),
        message: 'Invalid category'
      },
      required: [true, 'Category is required']
    },
    unit: {
      type: String,
      enum: {
        values: Object.values(RAW_MATERIAL_UNITS),
        message: 'Unit must be either kg or litre'
      },
      required: [true, 'Unit is required']
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative']
    },
    gstRate: {
      type: Number,
      min: [0, 'GST rate cannot be negative'],
      max: [28, 'GST rate cannot exceed 28%'],
      default: 0
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
      type: String,
      trim: true,
      default: null
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier is required']
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
rawMaterialSchema.index({ supplier: 1, status: 1 });
rawMaterialSchema.index({ category: 1 });
rawMaterialSchema.index({ materialType: 1 });
rawMaterialSchema.index({ supplierName: 1 });

// Virtual for supplier details
rawMaterialSchema.virtual('supplierDetails', {
  ref: 'User',
  localField: 'supplier',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
rawMaterialSchema.set('toJSON', { virtuals: true });
rawMaterialSchema.set('toObject', { virtuals: true });

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);

export default RawMaterial;
