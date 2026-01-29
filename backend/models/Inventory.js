import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      unique: true // Ensures one inventory document per product
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      default: 0
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 100
    },
    lastStockIn: {
      date: Date,
      quantity: Number,
      reference: String
    },
    lastStockOut: {
      date: Date,
      quantity: Number,
      reference: String
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lowStockAlertSent: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
inventorySchema.index({ product: 1 }, { unique: true });
inventorySchema.index({ availableQuantity: 1 });
inventorySchema.index({ reorderLevel: 1 });

// Virtual field for total quantity (available + reserved)
inventorySchema.virtual('totalQuantity').get(function () {
  return this.availableQuantity + this.reservedQuantity;
});

// Virtual field to check if stock is low
inventorySchema.virtual('isLowStock').get(function () {
  return this.availableQuantity <= this.reorderLevel;
});

/**
 * Update lastUpdated timestamp before save
 */
inventorySchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

/**
 * Method to check if sufficient quantity is available
 * @param {Number} quantity - Quantity to check
 * @returns {Boolean}
 */
inventorySchema.methods.hasAvailableStock = function (quantity) {
  return this.availableQuantity >= quantity;
};

/**
 * Method to reserve quantity for pending orders
 * @param {Number} quantity - Quantity to reserve
 */
inventorySchema.methods.reserveStock = function (quantity) {
  if (this.availableQuantity < quantity) {
    throw new Error('Insufficient stock available to reserve');
  }
  this.availableQuantity -= quantity;
  this.reservedQuantity += quantity;
  return this;
};

/**
 * Method to release reserved quantity (e.g., when order is cancelled)
 * @param {Number} quantity - Quantity to release
 */
inventorySchema.methods.releaseStock = function (quantity) {
  if (this.reservedQuantity < quantity) {
    throw new Error('Cannot release more than reserved quantity');
  }
  this.reservedQuantity -= quantity;
  this.availableQuantity += quantity;
  return this;
};

/**
 * Method to confirm stock out (convert reserved to actual stock out)
 * @param {Number} quantity - Quantity to confirm
 */
inventorySchema.methods.confirmStockOut = function (quantity) {
  if (this.reservedQuantity < quantity) {
    throw new Error('Cannot confirm more than reserved quantity');
  }
  this.reservedQuantity -= quantity;
  this.lastStockOut = {
    date: new Date(),
    quantity,
    reference: 'Order'
  };
  return this;
};

/**
 * Method to add stock (stock-in)
 * @param {Number} quantity - Quantity to add
 * @param {String} reference - Reference (e.g., purchase order number)
 */
inventorySchema.methods.addStock = function (quantity, reference = 'Manual') {
  this.availableQuantity += quantity;
  this.lastStockIn = {
    date: new Date(),
    quantity,
    reference
  };
  this.lowStockAlertSent = false; // Reset alert flag
  return this;
};

/**
 * Static method to get low stock products
 */
inventorySchema.statics.getLowStockProducts = async function () {
  return this.aggregate([
    {
      $match: {
        $expr: { $lte: ['$availableQuantity', '$reorderLevel'] }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    {
      $unwind: '$productDetails'
    },
    {
      $project: {
        product: 1,
        availableQuantity: 1,
        reorderLevel: 1,
        'productDetails.name': 1,
        'productDetails.sku': 1,
        'productDetails.category': 1
      }
    }
  ]);
};

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
