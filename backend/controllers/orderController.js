import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/response.js';
import { HTTP_STATUS, ORDER_STATUS, USER_ROLES, DEFAULTS } from '../config/constants.js';
import mongoose from 'mongoose';
import {
  notifyOrderApproved,
  notifyOrderRejected,
  notifyOrderStatusUpdate,
  notifyNewOrder,
  notifyOrderCancelled,
  getAdminUserIds
} from '../utils/notifications.js';
import { emitToUser, emitToAdmins } from '../config/socket.js';
import { paymentService } from '../services/paymentService.js';

/**
 * @desc    Place a new order (Wholesaler)
 * @route   POST /api/orders
 * @access  Private/Wholesaler
 */
export const placeOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, notes } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError('Order must contain at least one item', HTTP_STATUS.BAD_REQUEST));
  }

  // Validate and prepare order items
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    // Get product details
    const product = await Product.findById(item.productId);
    if (!product) {
      return next(new AppError(`Product not found: ${item.productId}`, HTTP_STATUS.NOT_FOUND));
    }

    if (!product.isActive) {
      return next(new AppError(`Product is not available: ${product.name}`, HTTP_STATUS.BAD_REQUEST));
    }

    // Check stock availability
    const inventory = await Inventory.findOne({ product: product._id });
    if (!inventory) {
      return next(new AppError(`No inventory found for product: ${product.name}`, HTTP_STATUS.BAD_REQUEST));
    }

    if (!inventory.hasAvailableStock(item.quantity)) {
      return next(new AppError(
        `Insufficient stock for ${product.name}. Available: ${inventory.availableQuantity}, Requested: ${item.quantity}`,
        HTTP_STATUS.BAD_REQUEST
      ));
    }

    // Reserve stock for this order
    inventory.reserveStock(item.quantity);
    inventory.updatedBy = req.user.id;
    await inventory.save();

    // Prepare order item
    const subtotal = item.quantity * product.basePrice;
    const gstAmount = (subtotal * (product.gstRate || 0)) / 100;
    
    const orderItem = {
      product: product._id,
      productName: product.name,
      sku: product.sku,
      quantity: item.quantity,
      unitPrice: product.basePrice,
      gstRate: product.gstRate || 0,
      subtotal: subtotal
    };

    orderItems.push(orderItem);
    totalAmount += (subtotal + gstAmount);
  }

  // Create order
  const order = await Order.create({
    wholesaler: req.user.id,
    items: orderItems,
    totalAmount,
    shippingAddress: shippingAddress || req.user.address,
    notes,
    orderStatus: ORDER_STATUS.PENDING
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('wholesaler', 'name email businessName')
    .populate('items.product', 'name category unit basePrice gstRate');

  // Send notification to admins about new order
  const adminIds = await getAdminUserIds();
  if (adminIds.length > 0) {
    await notifyNewOrder(populatedOrder, adminIds);
  }

  // Emit real-time event to admins
  emitToAdmins('new_order', {
    orderId: populatedOrder._id,
    orderNumber: populatedOrder.orderNumber,
    wholesaler: populatedOrder.wholesaler?.businessName || populatedOrder.wholesaler?.name,
    totalAmount: populatedOrder.totalAmount,
    itemsCount: populatedOrder.items.length
  });

  // Create Razorpay order
  let razorpayOrder = null;
  try {
    razorpayOrder = await paymentService.createOrder(totalAmount, order._id);
  } catch (error) {
    console.error('Failed to create Razorpay Order:', error);
    // Continue anyway; they can re-initiate payment later
  }

  sendSuccess(res, HTTP_STATUS.CREATED, {
    order: populatedOrder,
    razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
    amount: razorpayOrder ? razorpayOrder.amount : null,
    currency: razorpayOrder ? razorpayOrder.currency : null
  }, 'Order placed successfully. Awaiting payment/admin approval.');
});

/**
 * @desc    Approve order (Admin)
 * @route   PUT /api/orders/:id/approve
 * @access  Private/Admin
 */
export const approveOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  if (order.orderStatus !== ORDER_STATUS.PENDING) {
    return next(new AppError('Only pending orders can be approved', HTTP_STATUS.BAD_REQUEST));
  }

  // Approve order
  order.approve(req.user.id);

  // Process inventory - convert reserved stock to actual stock-out
  for (const item of order.items) {
    const inventory = await Inventory.findOne({ product: item.product });
    
    if (!inventory) {
      return next(new AppError(`Inventory not found for product: ${item.productName}`, HTTP_STATUS.NOT_FOUND));
    }

    // Confirm stock out (reduces reserved quantity)
    inventory.confirmStockOut(item.quantity);
    inventory.updatedBy = req.user.id;
    await inventory.save();
  }

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate('wholesaler', 'name email businessName')
    .populate('items.product', 'name category basePrice gstRate')
    .populate('approvedBy', 'name email');

  // Send notification to wholesaler
  await notifyOrderApproved(populatedOrder);

  // Emit real-time event to wholesaler
  emitToUser(populatedOrder.wholesaler._id, 'order_approved', {
    orderId: populatedOrder._id,
    orderNumber: populatedOrder.orderNumber,
    status: 'approved'
  });

  sendSuccess(res, HTTP_STATUS.OK, {
    order: populatedOrder
  }, 'Order approved successfully. Inventory updated.');
});

/**
 * @desc    Reject order (Admin)
 * @route   PUT /api/orders/:id/reject
 * @access  Private/Admin
 */
export const rejectOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Please provide a rejection reason', HTTP_STATUS.BAD_REQUEST));
  }

  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  if (order.orderStatus !== ORDER_STATUS.PENDING) {
    return next(new AppError('Only pending orders can be rejected', HTTP_STATUS.BAD_REQUEST));
  }

  // Reject order
  order.reject(req.user.id, reason);

  // Release reserved stock
  for (const item of order.items) {
    const inventory = await Inventory.findOne({ product: item.product });
    
    if (inventory) {
      inventory.releaseStock(item.quantity);
      inventory.updatedBy = req.user.id;
      await inventory.save();
    }
  }

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate('wholesaler', 'name email businessName')
    .populate('approvedBy', 'name email');

  // Send notification to wholesaler
  await notifyOrderRejected(populatedOrder);

  // Emit real-time event to wholesaler
  emitToUser(populatedOrder.wholesaler._id, 'order_rejected', {
    orderId: populatedOrder._id,
    orderNumber: populatedOrder.orderNumber,
    status: 'rejected',
    reason: reason
  });

  sendSuccess(res, HTTP_STATUS.OK, {
    order: populatedOrder
  }, 'Order rejected successfully. Reserved stock released.');
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  // Use appropriate method based on status
  try {
    switch (status) {
      case ORDER_STATUS.PROCESSING:
        order.markAsProcessing();
        break;
      case ORDER_STATUS.SHIPPED:
        order.markAsShipped();
        break;
      case ORDER_STATUS.DELIVERED:
        order.markAsDelivered();
        break;
      default:
        return next(new AppError('Invalid status transition', HTTP_STATUS.BAD_REQUEST));
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('wholesaler', 'name email businessName')
      .populate('items.product', 'name category basePrice gstRate');

    // Send notification to wholesaler
    await notifyOrderStatusUpdate(populatedOrder, status);

    sendSuccess(res, HTTP_STATUS.OK, {
      order: populatedOrder
    }, `Order marked as ${status} successfully`);

  } catch (error) {
    return next(new AppError(error.message, HTTP_STATUS.BAD_REQUEST));
  }
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Wholesaler can cancel their own pending orders)
 */
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Please provide a cancellation reason', HTTP_STATUS.BAD_REQUEST));
  }

  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  // Wholesalers can only cancel their own pending orders
  if (req.user.role === USER_ROLES.WHOLESALER && order.wholesaler.toString() !== req.user.id) {
    return next(new AppError('You can only cancel your own orders', HTTP_STATUS.FORBIDDEN));
  }

  if (!order.canBeCancelled()) {
    return next(new AppError('This order cannot be cancelled', HTTP_STATUS.BAD_REQUEST));
  }

  // Cancel order
  order.cancel(reason);

  // Release reserved stock
  for (const item of order.items) {
    const inventory = await Inventory.findOne({ product: item.product });
    
    if (inventory) {
      // If order was approved, add back to available stock
      if (order.orderStatus === ORDER_STATUS.APPROVED) {
        inventory.addStock(item.quantity, `Order Cancelled: ${order.orderNumber}`);
      } else {
        // If pending, release reserved stock
        inventory.releaseStock(item.quantity);
      }
      inventory.updatedBy = req.user.id;
      await inventory.save();
    }
  }

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate('wholesaler', 'name email businessName');

  // Send notification to wholesaler
  await notifyOrderCancelled(populatedOrder);

  sendSuccess(res, HTTP_STATUS.OK, {
    order: populatedOrder
  }, 'Order cancelled successfully. Stock restored.');
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit) || DEFAULTS.LIMIT;
  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by status
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }

  // Filter by wholesaler
  if (req.query.wholesalerId) {
    filter.wholesaler = req.query.wholesalerId;
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

  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .populate('wholesaler', 'name email businessName phone')
    .populate('items.product', 'name sku category')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendPaginatedResponse(res, { orders }, page, limit, total, 'Orders retrieved successfully');
});

/**
 * @desc    Get wholesaler's order history
 * @route   GET /api/orders/my-orders
 * @access  Private/Wholesaler
 */
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit) || DEFAULTS.LIMIT;
  const skip = (page - 1) * limit;

  const filter = { wholesaler: req.user.id };

  // Filter by status
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }

  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .populate('items.product', 'name sku category unit')
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendPaginatedResponse(res, { orders }, page, limit, total, 'Order history retrieved successfully');
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('wholesaler', 'name email businessName phone address')
    .populate('items.product', 'name sku category unit brand')
    .populate('approvedBy', 'name email');

  if (!order) {
    return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
  }

  // Wholesalers can only view their own orders
  if (req.user.role === USER_ROLES.WHOLESALER && order.wholesaler._id.toString() !== req.user.id) {
    return next(new AppError('You can only view your own orders', HTTP_STATUS.FORBIDDEN));
  }

  sendSuccess(res, HTTP_STATUS.OK, { order }, 'Order retrieved successfully');
});

/**
 * @desc    Get pending orders (Admin)
 * @route   GET /api/orders/pending
 * @access  Private/Admin
 */
export const getPendingOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ orderStatus: ORDER_STATUS.PENDING })
    .populate('wholesaler', 'name email businessName phone')
    .populate('items.product', 'name sku category')
    .sort({ createdAt: -1 });

  sendSuccess(res, HTTP_STATUS.OK, {
    count: orders.length,
    orders
  }, 'Pending orders retrieved successfully');
});

/**
 * @desc    Get order statistics (Admin)
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = asyncHandler(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $facet: {
        statusDistribution: [
          {
            $group: {
              _id: '$orderStatus',
              count: { $sum: 1 },
              totalAmount: { $sum: '$totalAmount' }
            }
          },
          {
            $sort: { count: -1 }
          }
        ],
        overallStats: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' },
              totalBaseAmount: { $sum: '$baseTotalAmount' },
              totalGstAmount: { $sum: '$totalGstAmount' },
              averageOrderValue: { $avg: '$totalAmount' }
            }
          }
        ],
        recentOrders: [
          {
            $sort: { createdAt: -1 }
          },
          {
            $limit: 5
          },
          {
            $lookup: {
              from: 'users',
              localField: 'wholesaler',
              foreignField: '_id',
              as: 'wholesalerInfo'
            }
          },
          {
            $unwind: '$wholesalerInfo'
          },
          {
            $project: {
              orderNumber: 1,
              totalAmount: 1,
              orderStatus: 1,
              createdAt: 1,
              'wholesalerInfo.name': 1
            }
          }
        ]
      }
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: stats[0]
  }, 'Order statistics retrieved successfully');
});

/**
 * @desc    Get monthly revenue data (Admin)
 * @route   GET /api/orders/revenue/monthly
 * @access  Private/Admin
 */
export const getMonthlyRevenue = asyncHandler(async (req, res, next) => {
  const currentYear = new Date().getFullYear();
  
  const monthlyData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(currentYear, 0, 1),
          $lte: new Date(currentYear, 11, 31, 23, 59, 59)
        },
        orderStatus: { $in: [ORDER_STATUS.APPROVED, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED] }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalAmount' },
        baseAmount: { $sum: '$baseTotalAmount' },
        gstAmount: { $sum: '$totalGstAmount' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Fill in missing months with zero revenue
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const monthData = monthlyData.find(d => d._id === i + 1);
    return {
      month: i + 1,
      revenue: monthData?.revenue || 0,
      baseAmount: monthData?.baseAmount || 0,
      gstAmount: monthData?.gstAmount || 0,
      orderCount: monthData?.orderCount || 0
    };
  });

  sendSuccess(res, HTTP_STATUS.OK, {
    year: currentYear,
    monthlyRevenue
  }, 'Monthly revenue data retrieved successfully');
});
