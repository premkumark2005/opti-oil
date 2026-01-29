import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES, UNITS } from '../config/constants.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: Object.values(PRODUCT_CATEGORIES),
        message: 'Please select a valid category'
      }
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative']
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      enum: {
        values: Object.values(UNITS),
        message: 'Please select a valid unit'
      },
      default: UNITS.LITER
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters']
    },
    packagingSize: {
      type: Number,
      required: [true, 'Packaging size is required'],
      min: [0, 'Packaging size cannot be negative']
    },
    image: {
      type: String,
      trim: true
    },
    specifications: {
      type: Map,
      of: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ basePrice: 1 });

// Virtual field to get current stock (will be populated from Inventory)
productSchema.virtual('inventory', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'product',
  justOne: true
});

/**
 * Generate SKU automatically if not provided
 */
productSchema.pre('save', async function (next) {
  if (!this.sku) {
    // Generate SKU format: CAT-TIMESTAMP-RANDOM
    const categoryPrefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.sku = `${categoryPrefix}-${timestamp}-${random}`;
  }
  next();
});

/**
 * Update 'updatedBy' field before save
 */
productSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.modifiedBy || this.createdBy;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
