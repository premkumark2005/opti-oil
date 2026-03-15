import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { USER_ROLES, USER_STATUS, HTTP_STATUS } from '../config/constants.js';

/**
 * @desc    Register a new supplier
 * @route   POST /api/supplier-auth/register
 * @access  Public
 */
export const registerSupplier = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, companyName, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', HTTP_STATUS.CONFLICT));
  }

  // Create supplier with pending status
  const supplier = await User.create({
    name,
    email,
    password,
    phone,
    businessName: companyName, // Map companyName to businessName field
    address,
    role: USER_ROLES.SUPPLIER,
    status: USER_STATUS.PENDING
  });

  sendSuccess(res, HTTP_STATUS.CREATED, {
    supplier: supplier.toSafeObject()
  }, 'Registration successful. Your account is pending admin approval.');
});

/**
 * @desc    Login supplier
 * @route   POST /api/supplier-auth/login
 * @access  Public
 */
export const loginSupplier = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', HTTP_STATUS.BAD_REQUEST));
  }

  // Find supplier and include password field
  const supplier = await User.findOne({ email, role: USER_ROLES.SUPPLIER }).select('+password');

  if (!supplier) {
    return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  // Check if password matches
  const isPasswordMatch = await supplier.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  // Check if supplier account is approved
  if (supplier.status === USER_STATUS.PENDING) {
    return next(new AppError('Your account is pending admin approval', HTTP_STATUS.FORBIDDEN));
  }

  if (supplier.status === USER_STATUS.REJECTED) {
    return next(new AppError('Your account has been rejected', HTTP_STATUS.FORBIDDEN));
  }

  if (supplier.status === USER_STATUS.INACTIVE) {
    return next(new AppError('Your account has been deactivated', HTTP_STATUS.FORBIDDEN));
  }

  // Update last login
  supplier.lastLogin = new Date();
  await supplier.save();

  // Generate token
  const token = supplier.generateAuthToken();

  sendSuccess(res, HTTP_STATUS.OK, {
    token,
    supplier: supplier.toSafeObject()
  }, 'Login successful');
});

/**
 * @desc    Get current supplier profile
 * @route   GET /api/supplier-auth/me
 * @access  Private (Supplier)
 */
export const getSupplierProfile = asyncHandler(async (req, res, next) => {
  const supplier = await User.findById(req.user._id);

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  sendSuccess(res, HTTP_STATUS.OK, {
    supplier: supplier.toSafeObject()
  });
});

/**
 * @desc    Update supplier profile
 * @route   PUT /api/supplier-auth/profile
 * @access  Private (Supplier)
 */
export const updateSupplierProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, companyName, address, accountHolderName, bankAccountNumber, bankIFSC } = req.body;

  const supplier = await User.findById(req.user._id);

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  // Update fields
  if (name) supplier.name = name;
  if (phone) supplier.phone = phone;
  if (companyName) supplier.businessName = companyName;
  if (address) supplier.address = address;
  
  // Update bank details
  if (accountHolderName !== undefined) supplier.accountHolderName = accountHolderName;
  if (bankAccountNumber !== undefined) supplier.bankAccountNumber = bankAccountNumber;
  if (bankIFSC !== undefined) supplier.bankIFSC = bankIFSC;

  await supplier.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    supplier: supplier.toSafeObject()
  }, 'Profile updated successfully');
});

/**
 * @desc    Change supplier password
 * @route   PUT /api/supplier-auth/change-password
 * @access  Private (Supplier)
 */
export const changeSupplierPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', HTTP_STATUS.BAD_REQUEST));
  }

  const supplier = await User.findById(req.user._id).select('+password');

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check current password
  const isPasswordMatch = await supplier.comparePassword(currentPassword);

  if (!isPasswordMatch) {
    return next(new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED));
  }

  // Update password
  supplier.password = newPassword;
  await supplier.save();

  sendSuccess(res, HTTP_STATUS.OK, {}, 'Password changed successfully');
});
