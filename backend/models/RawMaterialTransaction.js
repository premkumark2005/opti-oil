import mongoose from 'mongoose';

const rawMaterialTransactionSchema = new mongoose.Schema(
  {
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: false  // Optional now, we use materialType as primary identifier
    },
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      index: true
    },
    transactionType: {
      type: String,
      enum: ['stock-in', 'stock-out', 'adjustment'],
      required: [true, 'Transaction type is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required']
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    reference: {
      type: String,
      trim: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterialOrder'
    },
    performedBy: {
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
rawMaterialTransactionSchema.index({ rawMaterial: 1, createdAt: -1 });
rawMaterialTransactionSchema.index({ transactionType: 1 });

// Virtual for raw material details
rawMaterialTransactionSchema.virtual('rawMaterialDetails', {
  ref: 'RawMaterial',
  localField: 'rawMaterial',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
rawMaterialTransactionSchema.set('toJSON', { virtuals: true });
rawMaterialTransactionSchema.set('toObject', { virtuals: true });

const RawMaterialTransaction = mongoose.model('RawMaterialTransaction', rawMaterialTransactionSchema);

export default RawMaterialTransaction;
