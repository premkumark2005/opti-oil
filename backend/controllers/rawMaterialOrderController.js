import RawMaterialOrder from '../models/RawMaterialOrder.js';
import RawMaterial from '../models/RawMaterial.js';
import RawMaterialInventory from '../models/RawMaterialInventory.js';
import RawMaterialTransaction from '../models/RawMaterialTransaction.js';
import Notification from '../models/Notification.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS, USER_ROLES, RAW_MATERIAL_ORDER_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';
import { emitRawMaterialOrderNotification } from '../config/socket.js';

/**
 * @desc    Create raw material order (Admin)
 * @route   POST /api/raw-material-orders
 * @access  Private (Admin)
 */
export const createRawMaterialOrder = asyncHandler(async (req, res, next) => {
  const { rawMaterialId, quantityOrdered, notes } = req.body;

  // Find raw material
  const rawMaterial = await RawMaterial.findById(rawMaterialId).populate('supplier');

  if (!rawMaterial) {
    return next(new AppError('Raw material not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if raw material is active
  if (rawMaterial.status !== 'active') {
    return next(new AppError('This raw material is not available', HTTP_STATUS.BAD_REQUEST));
  }

  // Check if supplier has enough available quantity
  if (quantityOrdered > rawMaterial.availableQuantity) {
    return next(new AppError(`Only ${rawMaterial.availableQuantity} ${rawMaterial.unit} available. Cannot order ${quantityOrdered} ${rawMaterial.unit}.`, HTTP_STATUS.BAD_REQUEST));
  }

  // Create order
  const order = await RawMaterialOrder.create({
    rawMaterial: rawMaterialId,
    supplier: rawMaterial.supplier._id,
    quantityOrdered,
    pricePerUnit: rawMaterial.pricePerUnit,
    notes,
    placedBy: req.user._id
  });

  await order.populate([
    { path: 'rawMaterial', select: 'materialType supplierName category unit' },
    { path: 'supplier', select: 'name email businessName phone' },
    { path: 'placedBy', select: 'name email businessName' }
  ]);

  // Create notification for supplier
  await Notification.create({
    user: rawMaterial.supplier._id,
    type: NOTIFICATION_TYPES.RAW_MATERIAL_ORDER,
    title: 'New Raw Material Order',
    message: `You have received a new order for ${rawMaterial.name} (Qty: ${quantityOrdered} ${rawMaterial.unit})`,
    relatedId: order._id,
    relatedModel: 'RawMaterialOrder'
  });

  // Emit socket event
  emitRawMaterialOrderNotification(rawMaterial.supplier._id, {
    order: order.toObject(),
    message: 'New raw material order received'
  });

  sendSuccess(res, HTTP_STATUS.CREATED, { order }, 'Order placed successfully');
});

/**
 * @desc    Get all raw material orders
 * @route   GET /api/raw-material-orders
 * @access  Private (Admin, Supplier)
 */
export const getAllRawMaterialOrders = asyncHandler(async (req, res, next) => {
  const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

  const query = {};

  // If user is supplier, show only their orders
  if (req.user.role === USER_ROLES.SUPPLIER) {
    query.supplier = req.user._id;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.orderDate = {};
    if (startDate) query.orderDate.$gte = new Date(startDate);
    if (endDate) query.orderDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const orders = await RawMaterialOrder.find(query)
    .populate('rawMaterial', 'materialType supplierName category unit')
    .populate('supplier', 'name email businessName phone')
    .populate('placedBy', 'name email businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await RawMaterialOrder.countDocuments(query);

  sendSuccess(res, HTTP_STATUS.OK, {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get raw material order by ID
 * @route   GET /api/raw-material-orders/:id
 * @access  Private (Admin, Supplier)
 */
export const getRawMaterialOrderById = asyncHandler(async (req, res, next) => {
  const order = await RawMaterialOrder.findById(req.params.id)
    .populate('rawMaterial', 'materialType supplierName category unit description')
    .populate('supplier', 'name email businessName phone address')
    .populate('placedBy', 'name email businessName');

  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  // Suppliers can only view their own orders
  if (
    req.user.role === USER_ROLES.SUPPLIER &&
    order.supplier._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to view this order', HTTP_STATUS.FORBIDDEN));
  }

  sendSuccess(res, HTTP_STATUS.OK, { order });
});

/**
 * @desc    Update order status (Supplier)
 * @route   PUT /api/raw-material-orders/:id/status
 * @access  Private (Supplier)
 */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!Object.values(RAW_MATERIAL_ORDER_STATUS).includes(status)) {
    return next(new AppError('Invalid status', HTTP_STATUS.BAD_REQUEST));
  }

  const order = await RawMaterialOrder.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if supplier owns this order
  if (order.supplier.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this order', HTTP_STATUS.FORBIDDEN));
  }

  order.status = status;

  // If delivered, set delivery date
  if (status === RAW_MATERIAL_ORDER_STATUS.DELIVERED) {
    order.deliveryDate = new Date();
  }

  await order.save();

  await order.populate([
    { path: 'rawMaterial', select: 'materialType supplierName category unit' },
    { path: 'supplier', select: 'name email businessName' }
  ]);

  // Create notification for admin
  await Notification.create({
    user: order.placedBy,
    type: NOTIFICATION_TYPES.RAW_MATERIAL_ORDER,
    title: 'Order Status Updated',
    message: `Raw material order ${order.orderNumber} has been marked as ${status}`,
    relatedId: order._id,
    relatedModel: 'RawMaterialOrder'
  });

  sendSuccess(res, HTTP_STATUS.OK, { order }, `Order marked as ${status}`);
});

/**
 * @desc    Mark order as delivered and update inventory (Supplier)
 * @route   PUT /api/raw-material-orders/:id/deliver
 * @access  Private (Supplier)
 */
export const markOrderAsDelivered = asyncHandler(async (req, res, next) => {
  const order = await RawMaterialOrder.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if supplier owns this order
  if (order.supplier.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this order', HTTP_STATUS.FORBIDDEN));
  }

  if (order.status === RAW_MATERIAL_ORDER_STATUS.DELIVERED) {
    return next(new AppError('Order is already delivered', HTTP_STATUS.BAD_REQUEST));
  }

  // Update order status
  order.status = RAW_MATERIAL_ORDER_STATUS.DELIVERED;
  order.deliveryDate = new Date();
  await order.save();

  // Update supplier's raw material available quantity
  const rawMaterial = await RawMaterial.findById(order.rawMaterial);
  if (rawMaterial) {
    rawMaterial.availableQuantity = Math.max(0, rawMaterial.availableQuantity - order.quantityOrdered);
    await rawMaterial.save();
  }

  // Update or create admin's inventory (grouped by materialType)
  let inventory = await RawMaterialInventory.findOne({ 
    materialType: rawMaterial.materialType 
  });

  const previousQuantity = inventory ? inventory.quantity : 0;
  const newQuantity = previousQuantity + order.quantityOrdered;

  if (inventory) {
    inventory.quantity = newQuantity;
    inventory.lastStockIn = new Date();
    await inventory.save();
  } else {
    inventory = await RawMaterialInventory.create({
      materialType: rawMaterial.materialType,
      category: rawMaterial.category,
      unit: rawMaterial.unit,
      quantity: order.quantityOrdered,
      lastStockIn: new Date()
    });
  }

  // Create transaction record
  await RawMaterialTransaction.create({
    rawMaterial: order.rawMaterial,
    materialType: rawMaterial.materialType,
    transactionType: 'stock-in',
    quantity: order.quantityOrdered,
    previousQuantity,
    newQuantity,
    reason: `Order delivered: ${order.orderNumber}`,
    reference: order.orderNumber,
    order: order._id,
    performedBy: req.user._id
  });

  await order.populate([
    { path: 'rawMaterial', select: 'materialType supplierName category unit' },
    { path: 'supplier', select: 'name email businessName' }
  ]);

  // Notify admin
  await Notification.create({
    user: order.placedBy,
    type: NOTIFICATION_TYPES.RAW_MATERIAL_DELIVERED,
    title: 'Raw Material Delivered',
    message: `Order ${order.orderNumber} has been delivered. Inventory updated.`,
    relatedId: order._id,
    relatedModel: 'RawMaterialOrder'
  });

  sendSuccess(res, HTTP_STATUS.OK, { order, inventory }, 'Order delivered and inventory updated');
});

/**
 * @desc    Get order statistics (Supplier)
 * @route   GET /api/raw-material-orders/stats/overview
 * @access  Private (Supplier)
 */
export const getSupplierOrderStats = asyncHandler(async (req, res, next) => {
  const supplierId = req.user._id;

  const totalOrders = await RawMaterialOrder.countDocuments({ supplier: supplierId });
  const pendingOrders = await RawMaterialOrder.countDocuments({
    supplier: supplierId,
    status: RAW_MATERIAL_ORDER_STATUS.PENDING
  });
  const confirmedOrders = await RawMaterialOrder.countDocuments({
    supplier: supplierId,
    status: RAW_MATERIAL_ORDER_STATUS.CONFIRMED
  });
  const deliveredOrders = await RawMaterialOrder.countDocuments({
    supplier: supplierId,
    status: RAW_MATERIAL_ORDER_STATUS.DELIVERED
  });

  // Calculate total revenue
  const revenueData = await RawMaterialOrder.aggregate([
    {
      $match: {
        supplier: supplierId,
        status: RAW_MATERIAL_ORDER_STATUS.DELIVERED
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      delivered: deliveredOrders,
      totalRevenue
    }
  });
});

/**
 * @desc    Get order statistics (Admin)
 * @route   GET /api/raw-material-orders/admin/stats
 * @access  Private (Admin)
 */
export const getAdminOrderStats = asyncHandler(async (req, res, next) => {
  const totalOrders = await RawMaterialOrder.countDocuments();
  const pendingOrders = await RawMaterialOrder.countDocuments({
    status: RAW_MATERIAL_ORDER_STATUS.PENDING
  });
  const deliveredOrders = await RawMaterialOrder.countDocuments({
    status: RAW_MATERIAL_ORDER_STATUS.DELIVERED
  });

  // Calculate total spent
  const spentData = await RawMaterialOrder.aggregate([
    {
      $match: {
        status: RAW_MATERIAL_ORDER_STATUS.DELIVERED
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$totalPrice' }
      }
    }
  ]);

  const totalSpent = spentData.length > 0 ? spentData[0].totalSpent : 0;

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: {
      total: totalOrders,
      pending: pendingOrders,
      delivered: deliveredOrders,
      totalSpent
    }
  });
});
