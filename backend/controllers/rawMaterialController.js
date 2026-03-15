import RawMaterial from '../models/RawMaterial.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js';

/**
 * @desc    Create raw material (Supplier)
 * @route   POST /api/raw-materials
 * @access  Private (Supplier)
 */
export const createRawMaterial = asyncHandler(async (req, res, next) => {
  const { materialType, supplierName, category, unit, pricePerUnit, availableQuantity, description, image, gstRate } = req.body;

  // Create raw material with supplier ID from authenticated user
  const rawMaterial = await RawMaterial.create({
    materialType,
    supplierName,
    category,
    unit,
    pricePerUnit,
    availableQuantity,
    description,
    image,
    gstRate,
    supplier: req.user._id
  });

  await rawMaterial.populate('supplier', 'name email businessName');

  sendSuccess(res, HTTP_STATUS.CREATED, { rawMaterial }, 'Raw material created successfully');
});

/**
 * @desc    Get all raw materials
 * @route   GET /api/raw-materials
 * @access  Private (Admin, Supplier)
 */
export const getAllRawMaterials = asyncHandler(async (req, res, next) => {
  const { category, status, search, page = 1, limit = 10, supplier } = req.query;

  const query = {};

  // If user is supplier, show only their raw materials
  if (req.user.role === USER_ROLES.SUPPLIER) {
    query.supplier = req.user._id;
  }

  // Filter by supplier (admin only)
  if (supplier && req.user.role === USER_ROLES.ADMIN) {
    query.supplier = supplier;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Search by name
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const rawMaterials = await RawMaterial.find(query)
    .populate('supplier', 'name email businessName phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await RawMaterial.countDocuments(query);

  sendSuccess(res, HTTP_STATUS.OK, {
    rawMaterials,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get raw material by ID
 * @route   GET /api/raw-materials/:id
 * @access  Private (Admin, Supplier)
 */
export const getRawMaterialById = asyncHandler(async (req, res, next) => {
  const rawMaterial = await RawMaterial.findById(req.params.id).populate(
    'supplier',
    'name email businessName phone address'
  );

  if (!rawMaterial) {
    return next(new AppError('Raw material not found', HTTP_STATUS.NOT_FOUND));
  }

  // Suppliers can only view their own raw materials
  if (
    req.user.role === USER_ROLES.SUPPLIER &&
    rawMaterial.supplier._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to view this raw material', HTTP_STATUS.FORBIDDEN));
  }

  sendSuccess(res, HTTP_STATUS.OK, { rawMaterial });
});

/**
 * @desc    Update raw material
 * @route   PUT /api/raw-materials/:id
 * @access  Private (Supplier)
 */
export const updateRawMaterial = asyncHandler(async (req, res, next) => {
  let rawMaterial = await RawMaterial.findById(req.params.id);

  if (!rawMaterial) {
    return next(new AppError('Raw material not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if supplier owns this raw material
  if (rawMaterial.supplier.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this raw material', HTTP_STATUS.FORBIDDEN));
  }

  const { materialType, supplierName, category, unit, pricePerUnit, availableQuantity, description, status, image, gstRate } = req.body;

  // Update fields
  if (materialType) rawMaterial.materialType = materialType;
  if (supplierName) rawMaterial.supplierName = supplierName;
  if (category) rawMaterial.category = category;
  if (unit) rawMaterial.unit = unit;
  if (pricePerUnit !== undefined) rawMaterial.pricePerUnit = pricePerUnit;
  if (availableQuantity !== undefined) rawMaterial.availableQuantity = availableQuantity;
  if (description !== undefined) rawMaterial.description = description;
  if (status) rawMaterial.status = status;
  if (image !== undefined) rawMaterial.image = image;
  if (gstRate !== undefined) rawMaterial.gstRate = gstRate;

  await rawMaterial.save();
  await rawMaterial.populate('supplier', 'name email businessName');

  sendSuccess(res, HTTP_STATUS.OK, { rawMaterial }, 'Raw material updated successfully');
});

/**
 * @desc    Delete raw material
 * @route   DELETE /api/raw-materials/:id
 * @access  Private (Supplier)
 */
export const deleteRawMaterial = asyncHandler(async (req, res, next) => {
  const rawMaterial = await RawMaterial.findById(req.params.id);

  if (!rawMaterial) {
    return next(new AppError('Raw material not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if supplier owns this raw material
  if (rawMaterial.supplier.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this raw material', HTTP_STATUS.FORBIDDEN));
  }

  await rawMaterial.deleteOne();

  sendSuccess(res, HTTP_STATUS.OK, {}, 'Raw material deleted successfully');
});

/**
 * @desc    Get supplier's raw material statistics
 * @route   GET /api/raw-materials/stats/overview
 * @access  Private (Supplier)
 */
export const getRawMaterialStats = asyncHandler(async (req, res, next) => {
  const supplierId = req.user._id;

  const totalMaterials = await RawMaterial.countDocuments({ supplier: supplierId });
  const activeMaterials = await RawMaterial.countDocuments({
    supplier: supplierId,
    status: 'active'
  });
  const inactiveMaterials = await RawMaterial.countDocuments({
    supplier: supplierId,
    status: 'inactive'
  });

  // Get category breakdown
  const categoryBreakdown = await RawMaterial.aggregate([
    { $match: { supplier: supplierId } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: {
      total: totalMaterials,
      active: activeMaterials,
      inactive: inactiveMaterials,
      byCategory: categoryBreakdown
    }
  });
});
