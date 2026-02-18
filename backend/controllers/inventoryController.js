import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/response.js';
import { HTTP_STATUS, TRANSACTION_TYPES, DEFAULTS } from '../config/constants.js';
import mongoose from 'mongoose';
import { notifyLowStock, getAdminUserIds } from '../utils/notifications.js';

/**
 * Helper function to validate numeric quantity
 */
const validateQuantity = (quantity, fieldName = 'Quantity') => {
  const numQty = Number(quantity);
  if (isNaN(numQty) || numQty < 0) {
    throw new AppError(`${fieldName} must be a non-negative number`, HTTP_STATUS.BAD_REQUEST);
  }
  if (numQty === 0) {
    throw new AppError(`${fieldName} must be greater than zero`, HTTP_STATUS.BAD_REQUEST);
  }
  return numQty;
};

/**
 * Helper function to check stock status
 * Returns: { isOutOfStock, isLowStock, status }
 */
const getStockStatus = (availableQuantity, reorderLevel) => {
  const quantity = Number(availableQuantity) || 0;
  const reorder = Number(reorderLevel) || 0;
  
  // Rule 1: Out of stock when quantity === 0
  if (quantity === 0) {
    return { isOutOfStock: true, isLowStock: false, status: 'OUT_OF_STOCK' };
  }
  
  // Rule 2: Low stock when quantity > 0 AND quantity <= reorderLevel AND reorderLevel > 0
  if (reorder > 0 && quantity > 0 && quantity <= reorder) {
    return { isOutOfStock: false, isLowStock: true, status: 'LOW_STOCK' };
  }
  
  // Normal stock
  return { isOutOfStock: false, isLowStock: false, status: 'IN_STOCK' };
};

/**
 * @desc    Stock-in operation (supplier delivery)
 * @route   POST /api/inventory/stock-in
 * @access  Private/Admin
 */
export const stockIn = asyncHandler(async (req, res, next) => {
  const { productId, quantity, supplierId, referenceNumber, unitCost, notes } = req.body;

  // Validate quantity
  const validQuantity = validateQuantity(quantity, 'Stock-in quantity');

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
  }

  // Get or create inventory record
  let inventory = await Inventory.findOne({ product: productId });
  
  if (!inventory) {
    inventory = await Inventory.create({
      product: productId,
      availableQuantity: 0,
      reorderLevel: DEFAULTS.LOW_STOCK_THRESHOLD,
      updatedBy: req.user.id
    });
  }

  const previousQuantity = Number(inventory.availableQuantity) || 0;

  // Add stock using model method (already has validation)
  inventory.addStock(validQuantity, referenceNumber || 'Stock-In');
  inventory.updatedBy = req.user.id;
  await inventory.save();

  // Create transaction record
  const transaction = await InventoryTransaction.create({
    product: productId,
    type: TRANSACTION_TYPES.STOCK_IN,
    quantity: validQuantity,
    previousQuantity,
    newQuantity: inventory.availableQuantity,
    supplier: supplierId,
    referenceNumber,
    unitCost,
    performedBy: req.user.id,
    notes
  });

  sendSuccess(res, HTTP_STATUS.CREATED, {
    inventory: await Inventory.findById(inventory._id).populate('product'),
    transaction,
    stockStatus: getStockStatus(inventory.availableQuantity, inventory.reorderLevel)
  }, 'Stock added successfully');
});

/**
 * @desc    Stock-out operation (after order approval)
 * @route   POST /api/inventory/stock-out
 * @access  Private/Admin
 */
export const stockOut = asyncHandler(async (req, res, next) => {
  const { productId, quantity, orderId, referenceNumber, notes } = req.body;

  // Validate quantity
  const validQuantity = validateQuantity(quantity, 'Stock-out quantity');

  // Get inventory record
  const inventory = await Inventory.findOne({ product: productId });
  
  if (!inventory) {
    return next(new AppError('Inventory not found for this product', HTTP_STATUS.NOT_FOUND));
  }

  const currentQuantity = Number(inventory.availableQuantity) || 0;

  // Validate sufficient stock
  if (currentQuantity < validQuantity) {
    return next(new AppError(
      `Insufficient stock. Available: ${currentQuantity}, Requested: ${validQuantity}`,
      HTTP_STATUS.BAD_REQUEST
    ));
  }

  const previousQuantity = currentQuantity;
  const newQuantity = Math.max(0, currentQuantity - validQuantity);

  // Perform stock-out (with safety check for negative values)
  inventory.availableQuantity = newQuantity;
  
  inventory.lastStockOut = {
    date: new Date(),
    quantity: validQuantity,
    reference: referenceNumber || orderId || 'Stock-Out'
  };
  inventory.updatedBy = req.user.id;
  await inventory.save();

  // Create transaction record
  const transaction = await InventoryTransaction.create({
    product: productId,
    type: TRANSACTION_TYPES.STOCK_OUT,
    quantity: validQuantity,
    previousQuantity,
    newQuantity,
    order: orderId,
    referenceNumber,
    performedBy: req.user.id,
    approvedBy: req.user.id,
    approvedAt: new Date(),
    notes
  });

  // Get stock status after transaction
  const stockStatus = getStockStatus(newQuantity, inventory.reorderLevel);

  const populatedInventory = await Inventory.findById(inventory._id).populate('product');

  // Send low stock notification to admins if needed
  if (stockStatus.isLowStock && !inventory.lowStockAlertSent) {
    const adminIds = await getAdminUserIds();
    if (adminIds.length > 0) {
      await notifyLowStock(populatedInventory, adminIds);
      inventory.lowStockAlertSent = true;
      await inventory.save();
    }
  }

  sendSuccess(res, HTTP_STATUS.OK, {
    inventory: populatedInventory,
    transaction,
    stockStatus,
    warning: stockStatus.isLowStock ? {
      message: 'Stock level is below reorder threshold',
      availableQuantity: newQuantity,
      reorderLevel: inventory.reorderLevel
    } : stockStatus.isOutOfStock ? {
      message: 'Product is now out of stock',
      availableQuantity: 0
    } : null
  }, 'Stock removed successfully');
});

/**
 * @desc    Get inventory for a specific product
 * @route   GET /api/inventory/product/:productId
 * @access  Private
 */
export const getProductInventory = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const inventory = await Inventory.findOne({ product: productId })
    .populate('product')
    .populate('updatedBy', 'name email');

  if (!inventory) {
    return next(new AppError('Inventory not found for this product', HTTP_STATUS.NOT_FOUND));
  }

  // Get accurate stock status
  const stockStatus = getStockStatus(inventory.availableQuantity, inventory.reorderLevel);

  sendSuccess(res, HTTP_STATUS.OK, {
    inventory,
    isLowStock: inventory.isLowStock,
    isOutOfStock: inventory.isOutOfStock,
    stockStatus: stockStatus.status,
    totalQuantity: inventory.totalQuantity
  }, 'Inventory retrieved successfully');
});

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private
 */
export const getAllInventory = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit) || DEFAULTS.LIMIT;
  const skip = (page - 1) * limit;

  const filter = {};
  
  // Filter by stock status - using strict rules
  if (req.query.lowStock === 'true') {
    // Low stock: quantity > 0 AND quantity <= reorderLevel AND reorderLevel > 0
    filter.$expr = {
      $and: [
        { $gt: ['$availableQuantity', 0] },
        { $gt: ['$reorderLevel', 0] },
        { $lte: ['$availableQuantity', '$reorderLevel'] }
      ]
    };
  } else if (req.query.outOfStock === 'true') {
    // Out of stock: quantity === 0
    filter.availableQuantity = 0;
  }

  const total = await Inventory.countDocuments(filter);
  
  const inventory = await Inventory.find(filter)
    .populate('product')
    .populate('updatedBy', 'name email')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  sendPaginatedResponse(res, { inventory }, page, limit, total, 'Inventory retrieved successfully');
});

/**
 * @desc    Get low stock products
 * @route   GET /api/inventory/low-stock
 * @access  Private/Admin
 */
export const getLowStockProducts = asyncHandler(async (req, res, next) => {
  const lowStockItems = await Inventory.getLowStockProducts();

  sendSuccess(res, HTTP_STATUS.OK, {
    count: lowStockItems.length,
    items: lowStockItems
  }, 'Low stock products retrieved successfully');
});

/**
 * @desc    Get top products by stock level
 * @route   GET /api/inventory/top-products
 * @access  Private/Admin
 */
export const getTopProductsByStock = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const topProducts = await Inventory.aggregate([
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
      $match: {
        'productDetails.isActive': true
      }
    },
    {
      $project: {
        availableQuantity: 1,
        reorderLevel: 1,
        product: {
          _id: '$productDetails._id',
          name: '$productDetails.name',
          sku: '$productDetails.sku',
          category: '$productDetails.category'
        }
      }
    },
    {
      $sort: { availableQuantity: -1 }
    },
    {
      $limit: limit
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    count: topProducts.length,
    items: topProducts
  }, `Top ${limit} products by stock level retrieved successfully`);
});

/**
 * @desc    Update reorder level
 * @route   PUT /api/inventory/:id/reorder-level
 * @access  Private/Admin
 */
export const updateReorderLevel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reorderLevel } = req.body;

  // Validate reorder level using helper
  if (reorderLevel !== null && reorderLevel !== undefined && reorderLevel !== 0) {
    validateQuantity(reorderLevel, 'Reorder level');
  }

  if (reorderLevel < 0) {
    return next(new AppError('Reorder level cannot be negative', HTTP_STATUS.BAD_REQUEST));
  }

  const inventory = await Inventory.findById(id);

  if (!inventory) {
    return next(new AppError('Inventory not found', HTTP_STATUS.NOT_FOUND));
  }

  inventory.reorderLevel = reorderLevel;
  inventory.updatedBy = req.user.id;
  inventory.lowStockAlertSent = false; // Reset alert
  await inventory.save();

  // Get updated stock status
  const stockStatus = getStockStatus(inventory.availableQuantity, inventory.reorderLevel);

  sendSuccess(res, HTTP_STATUS.OK, {
    inventory: await Inventory.findById(inventory._id).populate('product'),
    stockStatus
  }, 'Reorder level updated successfully');
});

/**
 * @desc    Get inventory transaction history
 * @route   GET /api/inventory/transactions
 * @access  Private/Admin
 */
export const getInventoryTransactions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit) || DEFAULTS.LIMIT;
  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by product
  if (req.query.productId) {
    filter.product = req.query.productId;
  }

  // Filter by type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const total = await InventoryTransaction.countDocuments(filter);

  const transactions = await InventoryTransaction.find(filter)
    .populate('product', 'name sku')
    .populate('supplier', 'name')
    .populate('order', 'orderNumber')
    .populate('performedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendPaginatedResponse(res, transactions, page, limit, total, 'Transactions retrieved successfully');
});

/**
 * @desc    Adjust inventory (manual correction)
 * @route   POST /api/inventory/adjust
 * @access  Private/Admin
 */
export const adjustInventory = asyncHandler(async (req, res, next) => {
  const { productId, quantity, notes } = req.body;

  // Validate adjustment quantity (can be positive or negative)
  if (quantity === 0) {
    return next(new AppError('Adjustment quantity cannot be zero', HTTP_STATUS.BAD_REQUEST));
  }

  const quantityNum = Number(quantity);
  if (isNaN(quantityNum)) {
    return next(new AppError('Adjustment quantity must be a valid number', HTTP_STATUS.BAD_REQUEST));
  }

  const inventory = await Inventory.findOne({ product: productId });
  
  if (!inventory) {
    return next(new AppError('Inventory not found for this product', HTTP_STATUS.NOT_FOUND));
  }

  const previousQuantity = inventory.availableQuantity;
  const newQuantity = Math.max(0, previousQuantity + quantityNum); // Prevent negative stock

  // Check if adjustment would result in negative stock
  if (previousQuantity + quantityNum < 0) {
    return next(new AppError('Adjustment would result in negative stock', HTTP_STATUS.BAD_REQUEST));
  }

  inventory.availableQuantity = newQuantity;
  inventory.updatedBy = req.user.id;
  await inventory.save();

  // Create transaction record
  const transaction = await InventoryTransaction.create({
    product: productId,
    type: TRANSACTION_TYPES.ADJUSTMENT,
    quantity: Math.abs(quantityNum),
    previousQuantity,
    newQuantity,
    performedBy: req.user.id,
    notes: notes || 'Manual inventory adjustment'
  });

  // Get accurate stock status after adjustment
  const stockStatus = getStockStatus(newQuantity, inventory.reorderLevel);

  sendSuccess(res, HTTP_STATUS.OK, {
    inventory: await Inventory.findById(inventory._id).populate('product'),
    transaction,
    stockStatus,
    warning: stockStatus.isLowStock ? {
      message: 'Stock level is below reorder threshold after adjustment',
      availableQuantity: newQuantity,
      reorderLevel: inventory.reorderLevel
    } : stockStatus.isOutOfStock ? {
      message: 'Product is now out of stock after adjustment',
      availableQuantity: 0
    } : null
  }, 'Inventory adjusted successfully');
});
