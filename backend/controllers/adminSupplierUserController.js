import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { USER_ROLES, USER_STATUS, HTTP_STATUS } from '../config/constants.js';
import { notifyAccountStatus } from '../utils/notifications.js';

/**
 * @desc    Get all supplier users
 * @route   GET /api/admin/supplier-users
 * @access  Private (Admin)
 */
export const getAllSupplierUsers = asyncHandler(async (req, res, next) => {
  const { status, search, page = 1, limit = 10 } = req.query;

  const query = { role: USER_ROLES.SUPPLIER };

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Search by name, email, or company name
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const suppliers = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  sendSuccess(res, HTTP_STATUS.OK, {
    suppliers,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get supplier user by ID
 * @route   GET /api/admin/supplier-users/:id
 * @access  Private (Admin)
 */
export const getSupplierUserById = asyncHandler(async (req, res, next) => {
  const supplier = await User.findOne({
    _id: req.params.id,
    role: USER_ROLES.SUPPLIER
  }).select('-password');

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  sendSuccess(res, HTTP_STATUS.OK, { supplier });
});

/**
 * @desc    Approve supplier user
 * @route   PUT /api/admin/supplier-users/:id/approve
 * @access  Private (Admin)
 */
export const approveSupplierUser = asyncHandler(async (req, res, next) => {
  const supplier = await User.findOne({
    _id: req.params.id,
    role: USER_ROLES.SUPPLIER
  });

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  if (supplier.status === USER_STATUS.APPROVED) {
    return next(new AppError('Supplier is already approved', HTTP_STATUS.BAD_REQUEST));
  }

  supplier.status = USER_STATUS.APPROVED;
  await supplier.save();

  // Send notification to supplier
  await notifyAccountStatus(supplier._id, 'approved', 'Your supplier account has been approved.');

  sendSuccess(res, HTTP_STATUS.OK, { supplier }, 'Supplier approved successfully');
});

/**
 * @desc    Reject supplier user
 * @route   PUT /api/admin/supplier-users/:id/reject
 * @access  Private (Admin)
 */
export const rejectSupplierUser = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const supplier = await User.findOne({
    _id: req.params.id,
    role: USER_ROLES.SUPPLIER
  });

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  supplier.status = USER_STATUS.REJECTED;
  await supplier.save();

  // Send notification to supplier
  const message = reason
    ? `Your supplier account has been rejected. Reason: ${reason}`
    : 'Your supplier account has been rejected.';
  await notifyAccountStatus(supplier._id, 'rejected', message);

  sendSuccess(res, HTTP_STATUS.OK, { supplier }, 'Supplier rejected successfully');
});

/**
 * @desc    Deactivate/activate supplier user
 * @route   PUT /api/admin/supplier-users/:id/toggle-status
 * @access  Private (Admin)
 */
export const toggleSupplierUserStatus = asyncHandler(async (req, res, next) => {
  const supplier = await User.findOne({
    _id: req.params.id,
    role: USER_ROLES.SUPPLIER
  });

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  // Toggle between active and inactive
  if (supplier.status === USER_STATUS.INACTIVE) {
    supplier.status = USER_STATUS.APPROVED;
  } else if (supplier.status === USER_STATUS.APPROVED) {
    supplier.status = USER_STATUS.INACTIVE;
  }

  await supplier.save();

  sendSuccess(res, HTTP_STATUS.OK, { supplier }, `Supplier ${supplier.status === USER_STATUS.INACTIVE ? 'deactivated' : 'activated'} successfully`);
});

/**
 * @desc    Delete supplier user
 * @route   DELETE /api/admin/supplier-users/:id
 * @access  Private (Admin)
 */
export const deleteSupplierUser = asyncHandler(async (req, res, next) => {
  const supplier = await User.findOne({
    _id: req.params.id,
    role: USER_ROLES.SUPPLIER
  });

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  await supplier.deleteOne();

  sendSuccess(res, HTTP_STATUS.OK, {}, 'Supplier deleted successfully');
});

/**
 * @desc    Get supplier user statistics
 * @route   GET /api/admin/supplier-users/stats/overview
 * @access  Private (Admin)
 */
export const getSupplierUserStats = asyncHandler(async (req, res, next) => {
  const totalSuppliers = await User.countDocuments({ role: USER_ROLES.SUPPLIER });
  const pendingSuppliers = await User.countDocuments({
    role: USER_ROLES.SUPPLIER,
    status: USER_STATUS.PENDING
  });
  const approvedSuppliers = await User.countDocuments({
    role: USER_ROLES.SUPPLIER,
    status: USER_STATUS.APPROVED
  });
  const rejectedSuppliers = await User.countDocuments({
    role: USER_ROLES.SUPPLIER,
    status: USER_STATUS.REJECTED
  });

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: {
      total: totalSuppliers,
      pending: pendingSuppliers,
      approved: approvedSuppliers,
      rejected: rejectedSuppliers
    }
  });
});
