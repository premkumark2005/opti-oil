import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { USER_ROLES, USER_STATUS, HTTP_STATUS } from '../config/constants.js';
import { notifyAccountStatus } from '../utils/notifications.js';

/**
 * @desc    Register a new wholesaler
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerWholesaler = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, businessName, businessLicense, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', HTTP_STATUS.CONFLICT));
  }

  // Create wholesaler with pending status
  const user = await User.create({
    name,
    email,
    password,
    phone,
    businessName,
    businessLicense,
    address,
    role: USER_ROLES.WHOLESALER,
    status: USER_STATUS.PENDING
  });

  sendSuccess(res, HTTP_STATUS.CREATED, {
    user: user.toSafeObject()
  }, 'Registration successful. Your account is pending admin approval.');
});

/**
 * @desc    Login user (Admin or Wholesaler)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', HTTP_STATUS.BAD_REQUEST));
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  // Check if password matches
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  // Check if wholesaler account is approved
  if (user.role === USER_ROLES.WHOLESALER && user.status === USER_STATUS.PENDING) {
    return next(new AppError('Your account is pending admin approval', HTTP_STATUS.FORBIDDEN));
  }

  if (user.status === USER_STATUS.REJECTED) {
    return next(new AppError('Your account has been rejected', HTTP_STATUS.FORBIDDEN));
  }

  if (user.status === USER_STATUS.INACTIVE) {
    return next(new AppError('Your account has been deactivated', HTTP_STATUS.FORBIDDEN));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = user.generateAuthToken();

  sendSuccess(res, HTTP_STATUS.OK, {
    token,
    user: user.toSafeObject()
  }, 'Login successful');
});

/**
 * @desc    Admin login (same as regular login but can add admin-specific logic)
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
export const adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', HTTP_STATUS.BAD_REQUEST));
  }

  // Find admin user
  const user = await User.findOne({ 
    email,
    role: USER_ROLES.ADMIN 
  }).select('+password');

  if (!user) {
    return next(new AppError('Invalid admin credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new AppError('Invalid admin credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = user.generateAuthToken();

  sendSuccess(res, HTTP_STATUS.OK, {
    token,
    user: user.toSafeObject()
  }, 'Admin login successful');
});

/**
 * @desc    Approve or reject wholesaler
 * @route   PUT /api/auth/wholesaler/:id/approve
 * @access  Private/Admin
 */
export const approveWholesaler = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  if (!status || ![USER_STATUS.APPROVED, USER_STATUS.REJECTED].includes(status)) {
    return next(new AppError('Status must be either approved or rejected', HTTP_STATUS.BAD_REQUEST));
  }

  // Find wholesaler
  const wholesaler = await User.findOne({
    _id: id,
    role: USER_ROLES.WHOLESALER
  });

  if (!wholesaler) {
    return next(new AppError('Wholesaler not found', HTTP_STATUS.NOT_FOUND));
  }

  // Update status
  wholesaler.status = status;
  await wholesaler.save();

  // Send notification to wholesaler
  await notifyAccountStatus(wholesaler, status === USER_STATUS.APPROVED);

  const message = status === USER_STATUS.APPROVED 
    ? 'Wholesaler approved successfully'
    : 'Wholesaler rejected successfully';

  sendSuccess(res, HTTP_STATUS.OK, {
    user: wholesaler.toSafeObject()
  }, message);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  sendSuccess(res, HTTP_STATUS.OK, {
    user: user.toSafeObject()
  }, 'User profile retrieved successfully');
});

/**
 * @desc    Get pending wholesalers
 * @route   GET /api/auth/wholesalers/pending
 * @access  Private/Admin
 */
export const getPendingWholesalers = asyncHandler(async (req, res, next) => {
  const wholesalers = await User.find({
    role: USER_ROLES.WHOLESALER,
    status: USER_STATUS.PENDING
  }).sort({ createdAt: -1 });

  sendSuccess(res, HTTP_STATUS.OK, {
    count: wholesalers.length,
    wholesalers: wholesalers.map(w => w.toSafeObject())
  }, 'Pending wholesalers retrieved successfully');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address, businessName, businessLicense } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Update allowed fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (businessName) user.businessName = businessName;
  if (businessLicense) user.businessLicense = businessLicense;

  await user.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    user: user.toSafeObject()
  }, 'Profile updated successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', HTTP_STATUS.BAD_REQUEST));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return next(new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, HTTP_STATUS.OK, {}, 'Password changed successfully');
});
