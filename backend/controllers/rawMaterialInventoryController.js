import RawMaterialInventory from '../models/RawMaterialInventory.js';
import RawMaterial from '../models/RawMaterial.js';
import RawMaterialTransaction from '../models/RawMaterialTransaction.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * @desc    Get all raw material inventory
 * @route   GET /api/raw-material-inventory
 * @access  Private (Admin)
 */
export const getAllRawMaterialInventory = asyncHandler(async (req, res, next) => {
  const { lowStock, search, page = 1, limit = 10 } = req.query;

  const query = {};

  const skip = (page - 1) * limit;

  let inventories = await RawMaterialInventory.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Filter low stock if requested
  if (lowStock === 'true') {
    inventories = inventories.filter(inv => inv.isLowStock);
  }

  // Filter by search
  if (search) {
    inventories = inventories.filter(inv =>
      inv.materialType.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = await RawMaterialInventory.countDocuments(query);

  sendSuccess(res, HTTP_STATUS.OK, {
    inventories,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get raw material inventory by ID
 * @route   GET /api/raw-material-inventory/:id
 * @access  Private (Admin)
 */
export const getRawMaterialInventoryById = asyncHandler(async (req, res, next) => {
  const inventory = await RawMaterialInventory.findById(req.params.id);

  if (!inventory) {
    return next(new AppError('Inventory not found', HTTP_STATUS.NOT_FOUND));
  }

  // Get recent transactions
  const transactions = await RawMaterialTransaction.find({
    materialType: inventory.materialType
  })
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  sendSuccess(res, HTTP_STATUS.OK, { inventory, transactions });
});

/**
 * @desc    Stock in raw material
 * @route   POST /api/raw-material-inventory/:id/stock-in
 * @access  Private (Admin)
 */
export const stockIn = asyncHandler(async (req, res, next) => {
  const { quantity, reason, reference } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Valid quantity is required', HTTP_STATUS.BAD_REQUEST));
  }

  const inventory = await RawMaterialInventory.findById(req.params.id).populate(
    'rawMaterial',
    'name unit'
  );

  if (!inventory) {
    return next(new AppError('Inventory not found', HTTP_STATUS.NOT_FOUND));
  }

  const previousQuantity = inventory.quantity;
  inventory.quantity += quantity;
  inventory.lastStockIn = new Date();
  await inventory.save();

  // Create transaction record
  await RawMaterialTransaction.create({
    rawMaterial: inventory.rawMaterial?._id || null,
    materialType: inventory.materialType,
    transactionType: 'stock-in',
    quantity,
    previousQuantity,
    newQuantity: inventory.quantity,
    reason: reason || 'Manual stock in',
    reference,
    performedBy: req.user._id
  });

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { inventory },
    `Successfully added ${quantity} ${inventory.rawMaterial.unit} to inventory`
  );
});

/**
 * @desc    Stock out raw material
 * @route   POST /api/raw-material-inventory/:id/stock-out
 * @access  Private (Admin)
 */
export const stockOut = asyncHandler(async (req, res, next) => {
  const { quantity, reason, reference } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Valid quantity is required', HTTP_STATUS.BAD_REQUEST));
  }

  const inventory = await RawMaterialInventory.findById(req.params.id).populate(
    'rawMaterial',
    'name unit'
  );

  if (!inventory) {
    return next(new AppError('Inventory not found', HTTP_STATUS.NOT_FOUND));
  }

  if (inventory.quantity < quantity) {
    return next(
      new AppError(
        `Insufficient stock. Available: ${inventory.quantity} ${inventory.rawMaterial.unit}`,
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }

  const previousQuantity = inventory.quantity;
  inventory.quantity -= quantity;
  inventory.lastStockOut = new Date();
  await inventory.save();

  // Create transaction record
  await RawMaterialTransaction.create({
    rawMaterial: inventory.rawMaterial?._id || null,
    materialType: inventory.materialType,
    transactionType: 'stock-out',
    quantity,
    previousQuantity,
    newQuantity: inventory.quantity,
    reason: reason || 'Manual stock out',
    reference,
    performedBy: req.user._id
  });

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { inventory },
    `Successfully removed ${quantity} ${inventory.rawMaterial.unit} from inventory`
  );
});

/**
 * @desc    Adjust inventory
 * @route   POST /api/raw-material-inventory/:id/adjust
 * @access  Private (Admin)
 */
export const adjustInventory = asyncHandler(async (req, res, next) => {
  const { newQuantity, reason } = req.body;

  if (newQuantity === undefined || newQuantity < 0) {
    return next(new AppError('Valid new quantity is required', HTTP_STATUS.BAD_REQUEST));
  }

  if (!reason) {
    return next(new AppError('Reason is required for adjustment', HTTP_STATUS.BAD_REQUEST));
  }

  const inventory = await RawMaterialInventory.findById(req.params.id).populate(
    'rawMaterial',
    'name unit'
  );

  if (!inventory) {
    return next(new AppError('Inventory not found', HTTP_STATUS.NOT_FOUND));
  }

  const previousQuantity = inventory.quantity;
  const quantityDiff = newQuantity - previousQuantity;

  inventory.quantity = newQuantity;
  await inventory.save();

  // Create transaction record
  await RawMaterialTransaction.create({
    rawMaterial: inventory.rawMaterial?._id || null,
    materialType: inventory.materialType,
    transactionType: 'adjustment',
    quantity: Math.abs(quantityDiff),
    previousQuantity,
    newQuantity: inventory.quantity,
    reason,
    performedBy: req.user._id
  });

  sendSuccess(res, HTTP_STATUS.OK, { inventory }, 'Inventory adjusted successfully');
});

/**
 * @desc    Update reorder level
 * @route   PUT /api/raw-material-inventory/:id/reorder-level
 * @access  Private (Admin)
 */
export const updateReorderLevel = asyncHandler(async (req, res, next) => {
  const { reorderLevel } = req.body;

  if (reorderLevel === undefined || reorderLevel < 0) {
    return next(new AppError('Valid reorder level is required', HTTP_STATUS.BAD_REQUEST));
  }

  const inventory = await RawMaterialInventory.findById(req.params.id);

  if (!inventory) {
    return next(new AppError('Inventory not found', HTTP_STATUS.NOT_FOUND));
  }

  inventory.reorderLevel = reorderLevel;
  await inventory.save();

  await inventory.populate({
    path: 'rawMaterial',
    select: 'name category unit'
  });

  sendSuccess(res, HTTP_STATUS.OK, { inventory }, 'Reorder level updated successfully');
});

/**
 * @desc    Get low stock raw materials
 * @route   GET /api/raw-material-inventory/low-stock
 * @access  Private (Admin)
 */
export const getLowStockRawMaterials = asyncHandler(async (req, res, next) => {
  const inventories = await RawMaterialInventory.find().populate({
    path: 'rawMaterial',
    select: 'name category unit supplier',
    populate: {
      path: 'supplier',
      select: 'name businessName email phone'
    }
  });

  // Filter items where quantity <= reorderLevel
  const lowStockItems = inventories.filter(inv => inv.isLowStock);

  sendSuccess(res, HTTP_STATUS.OK, {
    lowStockItems,
    count: lowStockItems.length
  });
});

/**
 * @desc    Get inventory statistics
 * @route   GET /api/raw-material-inventory/stats/overview
 * @access  Private (Admin)
 */
export const getInventoryStats = asyncHandler(async (req, res, next) => {
  const totalItems = await RawMaterialInventory.countDocuments();

  const inventories = await RawMaterialInventory.find();
  const lowStockCount = inventories.filter(inv => inv.isLowStock).length;

  // Total value calculation
  const inventoriesWithMaterials = await RawMaterialInventory.find().populate(
    'rawMaterial',
    'pricePerUnit'
  );

  const totalValue = inventoriesWithMaterials.reduce((sum, inv) => {
    return sum + inv.quantity * (inv.rawMaterial?.pricePerUnit || 0);
  }, 0);

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: {
      totalItems,
      lowStockCount,
      totalValue: totalValue.toFixed(2)
    }
  });
});

/**
 * @desc    Get inventory transactions
 * @route   GET /api/raw-material-inventory/:id/transactions
 * @access  Private (Admin)
 */
export const getInventoryTransactions = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const inventory = await RawMaterialInventory.findById(req.params.id);

  if (!inventory) {
    return next(new AppError('Inventory not found', HTTP_STATUS.NOT_FOUND));
  }

  const skip = (page - 1) * limit;

  const transactions = await RawMaterialTransaction.find({
    materialType: inventory.materialType
  })
    .populate('performedBy', 'name email')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await RawMaterialTransaction.countDocuments({
    materialType: inventory.materialType
  });

  sendSuccess(res, HTTP_STATUS.OK, {
    transactions,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});
