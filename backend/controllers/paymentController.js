import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';
import { paymentService } from '../services/paymentService.js';
import Order from '../models/Order.js';
import RawMaterialOrder from '../models/RawMaterialOrder.js';

/**
 * @desc    Verify Wholesaler Payment
 * @route   POST /api/payments/verify
 * @access  Private/Wholesaler
 */
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const isValid = paymentService.verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return next(new AppError('Invalid payment signature', HTTP_STATUS.BAD_REQUEST));
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  // Update order
  order.paymentStatus = 'completed'; // Matches PAYMENT_STATUS.COMPLETED
  order.paymentId = razorpay_payment_id;
  order.paymentSignature = razorpay_signature;
  order.paidAt = new Date();
  order.paymentMethod = 'Razorpay';

  await order.save();

  sendSuccess(res, HTTP_STATUS.OK, { order }, 'Payment verified successfully');
});

/**
 * @desc    Admin Payout to Supplier
 * @route   POST /api/payments/supplier
 * @access  Private/Admin
 */
export const createSupplierPayout = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  const rmOrder = await RawMaterialOrder.findById(orderId).populate('supplier');
  if (!rmOrder) {
    return next(new AppError('Raw material order not found', HTTP_STATUS.NOT_FOUND));
  }

  if (rmOrder.supplierPaymentStatus === 'Paid') {
    return next(new AppError('Payment already processed for this order', HTTP_STATUS.BAD_REQUEST));
  }

  const supplier = rmOrder.supplier;

  if (!supplier.bankAccountNumber || !supplier.bankIFSC) {
    return next(new AppError('Supplier bank details are incomplete. Please update the supplier profile.', HTTP_STATUS.BAD_REQUEST));
  }

  // Call Razorpay Payout API via our Service
  const payoutResponse = await paymentService.createPayout(
    supplier,
    rmOrder.totalPrice,
    rmOrder._id
  );

  // Update Supplier Order Status
  rmOrder.supplierPaymentStatus = 'Paid';
  rmOrder.supplierPaymentId = payoutResponse.id;
  rmOrder.supplierPaymentDate = new Date();

  await rmOrder.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    order: rmOrder,
    payout: payoutResponse
  }, 'Supplier payout successful');
});

/**
 * @desc    Create Razorpay Order for an existing order (re-initiate payment)
 * @route   POST /api/payments/order/:id
 * @access  Private/Wholesaler
 */
export const createExistingOrderPayment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }
  
  if (order.paymentStatus === 'completed') {
    return next(new AppError('Order is already paid', HTTP_STATUS.BAD_REQUEST));
  }
  
  const razorpayOrder = await paymentService.createOrder(order.totalAmount, order._id);
  
  sendSuccess(res, HTTP_STATUS.OK, {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency
  }, 'Payment order created');
});
