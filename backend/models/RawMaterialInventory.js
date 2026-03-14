import mongoose from 'mongoose';

const rawMaterialInventorySchema = new mongoose.Schema(
  {
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      unique: true
    },
    category: {
      type: String,
      required: [true, 'Category is required']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 100
    },
    lastStockIn: {
      type: Date
    },
    lastStockOut: {
      type: Date
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
rawMaterialInventorySchema.index({ materialType: 1 });
rawMaterialInventorySchema.index({ quantity: 1 });

// Virtual for raw material details
rawMaterialInventorySchema.virtual('rawMaterialDetails', {
  ref: 'RawMaterial',
  localField: 'rawMaterial',
  foreignField: '_id',
  justOne: true
});

// Virtual to check if stock is low
rawMaterialInventorySchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.reorderLevel;
});

// Pre-save hook to update lastUpdated
rawMaterialInventorySchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

// Ensure virtuals are included in JSON
rawMaterialInventorySchema.set('toJSON', { virtuals: true });
rawMaterialInventorySchema.set('toObject', { virtuals: true });

const RawMaterialInventory = mongoose.model('RawMaterialInventory', rawMaterialInventorySchema);

export default RawMaterialInventory;
