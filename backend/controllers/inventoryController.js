import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/response.js';
import { HTTP_STATUS, TRANSACTION_TYPES, DEFAULTS } from '../config/constants.js';
import mongoose from 'mongoose';
import { notifyLowStock, getAdminUserIds } from '../utils/notifications.js';

/**
 * @desc    Stock-in operation (supplier delivery)
 * @route   POST /api/inventory/stock-in
 * @access  Private/Admin
 */
export const stockIn = asyncHandler(async (req, res, next) => {
  const { productId, quantity, supplierId, referenceNumber, unitCost, notes } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate product exists
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
    }

    // Get or create inventory record
    let inventory = await Inventory.findOne({ product: productId }).session(session);
    
    if (!inventory) {
      inventory = await Inventory.create([{
        product: productId,
        availableQuantity: 0,
        reorderLevel: DEFAULTS.LOW_STOCK_THRESHOLD,
        updatedBy: req.user.id
      }], { session });
      inventory = inventory[0];
    }

    const previousQuantity = inventory.availableQuantity;

    // Add stock using model method
    inventory.addStock(quantity, referenceNumber || 'Stock-In');
    inventory.updatedBy = req.user.id;
    await inventory.save({ session });

    // Create transaction record
    const transaction = await InventoryTransaction.create([{
      product: productId,
      type: TRANSACTION_TYPES.STOCK_IN,
      quantity,
      previousQuantity,
      newQuantity: inventory.availableQuantity,
      supplier: supplierId,
      referenceNumber,
      unitCost,
      performedBy: req.user.id,
      notes
    }], { session });

    await session.commitTransaction();

    sendSuccess(res, HTTP_STATUS.CREATED, {
      inventory: await Inventory.findById(inventory._id).populate('product'),
      transaction: transaction[0]
    }, 'Stock added successfully');

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Stock-out operation (after order approval)
 * @route   POST /api/inventory/stock-out
 * @access  Private/Admin
 */
export const stockOut = asyncHandler(async (req, res, next) => {
  const { productId, quantity, orderId, referenceNumber, notes } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get inventory record
    const inventory = await Inventory.findOne({ product: productId }).session(session);
    
    if (!inventory) {
      await session.abortTransaction();
      return next(new AppError('Inventory not found for this product', HTTP_STATUS.NOT_FOUND));
    }

    // Check if sufficient stock is available
    if (!inventory.hasAvailableStock(quantity)) {
      await session.abortTransaction();
      return next(new AppError(
        `Insufficient stock. Available: ${inventory.availableQuantity}, Requested: ${quantity}`,
        HTTP_STATUS.BAD_REQUEST
      ));
    }

    const previousQuantity = inventory.availableQuantity;

    // Perform stock-out
    inventory.availableQuantity -= quantity;
    
    // Prevent negative stock (additional safety check)
    if (inventory.availableQuantity < 0) {
      await session.abortTransaction();
      return next(new AppError('Operation would result in negative stock', HTTP_STATUS.BAD_REQUEST));
    }

    inventory.lastStockOut = {
      date: new Date(),
      quantity,
      reference: referenceNumber || orderId || 'Stock-Out'
    };
    inventory.updatedBy = req.user.id;
    await inventory.save({ session });

    // Create transaction record
    const transaction = await InventoryTransaction.create([{
      product: productId,
      type: TRANSACTION_TYPES.STOCK_OUT,
      quantity,
      previousQuantity,
      newQuantity: inventory.availableQuantity,
      order: orderId,
      referenceNumber,
      performedBy: req.user.id,
      approvedBy: req.user.id,
      approvedAt: new Date(),
      notes
    }], { session });

    await session.commitTransaction();

    // Check for low stock after transaction
    const isLowStock = inventory.availableQuantity <= inventory.reorderLevel;

    const populatedInventory = await Inventory.findById(inventory._id).populate('product');

    // Send low stock notification to admins if below threshold
    if (isLowStock && !inventory.lowStockAlertSent) {
      const adminIds = await getAdminUserIds();
      if (adminIds.length > 0) {
        await notifyLowStock(populatedInventory, adminIds);
      }
    }

    sendSuccess(res, HTTP_STATUS.OK, {
      inventory: populatedInventory,
      transaction: transaction[0],
      lowStockWarning: isLowStock ? {
        message: 'Stock level is below reorder threshold',
        availableQuantity: inventory.availableQuantity,
        reorderLevel: inventory.reorderLevel
      } : null
    }, 'Stock removed successfully');

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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

  sendSuccess(res, HTTP_STATUS.OK, {
    inventory,
    isLowStock: inventory.isLowStock,
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
  
  // Filter by low stock
  if (req.query.lowStock === 'true') {
    filter.$expr = { $lte: ['$availableQuantity', '$reorderLevel'] };
  }

  const total = await Inventory.countDocuments(filter);
  
  const inventory = await Inventory.find(filter)
    .populate('product')
    .populate('updatedBy', 'name email')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  sendPaginatedResponse(res, inventory, page, limit, total, 'Inventory retrieved successfully');
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
 * @desc    Update reorder level
 * @route   PUT /api/inventory/:id/reorder-level
 * @access  Private/Admin
 */
export const updateReorderLevel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reorderLevel } = req.body;

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

  sendSuccess(res, HTTP_STATUS.OK, {
    inventory: await Inventory.findById(inventory._id).populate('product')
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const inventory = await Inventory.findOne({ product: productId }).session(session);
    
    if (!inventory) {
      await session.abortTransaction();
      return next(new AppError('Inventory not found for this product', HTTP_STATUS.NOT_FOUND));
    }

    const previousQuantity = inventory.availableQuantity;
    const newQuantity = previousQuantity + quantity;

    // Prevent negative stock
    if (newQuantity < 0) {
      await session.abortTransaction();
      return next(new AppError('Adjustment would result in negative stock', HTTP_STATUS.BAD_REQUEST));
    }

    inventory.availableQuantity = newQuantity;
    inventory.updatedBy = req.user.id;
    await inventory.save({ session });

    // Create transaction record
    const transaction = await InventoryTransaction.create([{
      product: productId,
      type: TRANSACTION_TYPES.ADJUSTMENT,
      quantity: Math.abs(quantity),
      previousQuantity,
      newQuantity,
      performedBy: req.user.id,
      notes: notes || 'Manual inventory adjustment'
    }], { session });

    await session.commitTransaction();

    sendSuccess(res, HTTP_STATUS.OK, {
      inventory: await Inventory.findById(inventory._id).populate('product'),
      transaction: transaction[0]
    }, 'Inventory adjusted successfully');

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
