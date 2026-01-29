import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS, ORDER_STATUS } from '../config/constants.js';

/**
 * @desc    Get current inventory status report
 * @route   GET /api/reports/inventory-status
 * @access  Private/Admin
 */
export const getInventoryStatusReport = asyncHandler(async (req, res, next) => {
  const report = await Inventory.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $match: {
        'productInfo.isActive': true
      }
    },
    {
      $facet: {
        // Overall summary
        summary: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalAvailableQuantity: { $sum: '$availableQuantity' },
              totalReservedQuantity: { $sum: '$reservedQuantity' },
              totalValue: {
                $sum: {
                  $multiply: ['$availableQuantity', '$productInfo.basePrice']
                }
              },
              lowStockProducts: {
                $sum: {
                  $cond: [
                    { $lte: ['$availableQuantity', '$reorderLevel'] },
                    1,
                    0
                  ]
                }
              },
              outOfStockProducts: {
                $sum: {
                  $cond: [{ $eq: ['$availableQuantity', 0] }, 1, 0]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalProducts: 1,
              totalAvailableQuantity: 1,
              totalReservedQuantity: 1,
              totalInventoryValue: { $round: ['$totalValue', 2] },
              lowStockProducts: 1,
              outOfStockProducts: 1,
              healthyStockProducts: {
                $subtract: [
                  '$totalProducts',
                  { $add: ['$lowStockProducts', '$outOfStockProducts'] }
                ]
              }
            }
          }
        ],
        // By category
        byCategory: [
          {
            $group: {
              _id: '$productInfo.category',
              productCount: { $sum: 1 },
              totalQuantity: { $sum: '$availableQuantity' },
              reservedQuantity: { $sum: '$reservedQuantity' },
              totalValue: {
                $sum: {
                  $multiply: ['$availableQuantity', '$productInfo.basePrice']
                }
              },
              lowStockCount: {
                $sum: {
                  $cond: [
                    { $lte: ['$availableQuantity', '$reorderLevel'] },
                    1,
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              category: '$_id',
              productCount: 1,
              totalQuantity: 1,
              reservedQuantity: 1,
              totalValue: { $round: ['$totalValue', 2] },
              lowStockCount: 1
            }
          },
          {
            $sort: { totalValue: -1 }
          }
        ],
        // Stock level distribution
        stockDistribution: [
          {
            $bucket: {
              groupBy: '$availableQuantity',
              boundaries: [0, 1, 50, 100, 500, 1000, 5000],
              default: '5000+',
              output: {
                count: { $sum: 1 },
                products: {
                  $push: {
                    name: '$productInfo.name',
                    sku: '$productInfo.sku',
                    quantity: '$availableQuantity'
                  }
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              range: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$_id', 0] }, then: 'Out of Stock (0)' },
                    { case: { $eq: ['$_id', 1] }, then: 'Critical (1-49)' },
                    { case: { $eq: ['$_id', 50] }, then: 'Low (50-99)' },
                    { case: { $eq: ['$_id', 100] }, then: 'Medium (100-499)' },
                    { case: { $eq: ['$_id', 500] }, then: 'Good (500-999)' },
                    { case: { $eq: ['$_id', 1000] }, then: 'High (1000-4999)' }
                  ],
                  default: 'Very High (5000+)'
                }
              },
              count: 1,
              productCount: { $size: '$products' }
            }
          }
        ],
        // Recent stock movements
        recentActivity: [
          {
            $lookup: {
              from: 'inventorytransactions',
              localField: 'product',
              foreignField: 'product',
              as: 'transactions'
            }
          },
          {
            $unwind: {
              path: '$transactions',
              preserveNullAndEmptyArrays: false
            }
          },
          {
            $sort: { 'transactions.createdAt': -1 }
          },
          {
            $limit: 10
          },
          {
            $project: {
              productName: '$productInfo.name',
              sku: '$productInfo.sku',
              transactionType: '$transactions.type',
              quantity: '$transactions.quantity',
              previousQuantity: '$transactions.previousQuantity',
              newQuantity: '$transactions.newQuantity',
              date: '$transactions.createdAt'
            }
          }
        ]
      }
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    report: {
      summary: report[0].summary[0] || {},
      byCategory: report[0].byCategory || [],
      stockDistribution: report[0].stockDistribution || [],
      recentActivity: report[0].recentActivity || []
    },
    generatedAt: new Date()
  }, 'Inventory status report generated successfully');
});

/**
 * @desc    Get low stock products report
 * @route   GET /api/reports/low-stock
 * @access  Private/Admin
 */
export const getLowStockReport = asyncHandler(async (req, res, next) => {
  const report = await Inventory.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $match: {
        'productInfo.isActive': true,
        $expr: { $lte: ['$availableQuantity', '$reorderLevel'] }
      }
    },
    {
      $lookup: {
        from: 'suppliers',
        let: { productId: '$product' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$$productId', '$suppliedProducts'] },
              isActive: true
            }
          },
          {
            $project: {
              name: 1,
              contactPerson: 1,
              email: 1,
              phone: 1
            }
          }
        ],
        as: 'suppliers'
      }
    },
    {
      $addFields: {
        quantityNeeded: {
          $subtract: ['$reorderLevel', '$availableQuantity']
        },
        stockStatus: {
          $cond: [
            { $eq: ['$availableQuantity', 0] },
            'OUT_OF_STOCK',
            { $cond: [
              { $lt: ['$availableQuantity', { $multiply: ['$reorderLevel', 0.5] }] },
              'CRITICAL',
              'LOW'
            ]}
          ]
        }
      }
    },
    {
      $project: {
        productId: '$product',
        name: '$productInfo.name',
        sku: '$productInfo.sku',
        category: '$productInfo.category',
        brand: '$productInfo.brand',
        unit: '$productInfo.unit',
        basePrice: '$productInfo.basePrice',
        availableQuantity: 1,
        reservedQuantity: 1,
        reorderLevel: 1,
        quantityNeeded: 1,
        stockStatus: 1,
        lastStockIn: 1,
        lastStockOut: 1,
        suppliers: 1,
        estimatedRestockCost: {
          $multiply: ['$quantityNeeded', '$productInfo.basePrice']
        }
      }
    },
    {
      $sort: { stockStatus: 1, availableQuantity: 1 }
    },
    {
      $facet: {
        products: [
          { $skip: 0 },
          { $limit: 100 }
        ],
        summary: [
          {
            $group: {
              _id: null,
              totalLowStockProducts: { $sum: 1 },
              outOfStockCount: {
                $sum: { $cond: [{ $eq: ['$stockStatus', 'OUT_OF_STOCK'] }, 1, 0] }
              },
              criticalCount: {
                $sum: { $cond: [{ $eq: ['$stockStatus', 'CRITICAL'] }, 1, 0] }
              },
              lowCount: {
                $sum: { $cond: [{ $eq: ['$stockStatus', 'LOW'] }, 1, 0] }
              },
              totalRestockCost: { $sum: '$estimatedRestockCost' }
            }
          },
          {
            $project: {
              _id: 0,
              totalLowStockProducts: 1,
              outOfStockCount: 1,
              criticalCount: 1,
              lowCount: 1,
              estimatedRestockCost: { $round: ['$totalRestockCost', 2] }
            }
          }
        ],
        byCategory: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              outOfStock: {
                $sum: { $cond: [{ $eq: ['$stockStatus', 'OUT_OF_STOCK'] }, 1, 0] }
              },
              totalRestockCost: { $sum: '$estimatedRestockCost' }
            }
          },
          {
            $project: {
              _id: 0,
              category: '$_id',
              count: 1,
              outOfStock: 1,
              totalRestockCost: { $round: ['$totalRestockCost', 2] }
            }
          },
          {
            $sort: { count: -1 }
          }
        ]
      }
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    report: {
      summary: report[0].summary[0] || {},
      products: report[0].products || [],
      byCategory: report[0].byCategory || []
    },
    generatedAt: new Date()
  }, 'Low stock report generated successfully');
});

/**
 * @desc    Get wholesale order summary report
 * @route   GET /api/reports/order-summary
 * @access  Private/Admin
 */
export const getOrderSummaryReport = asyncHandler(async (req, res, next) => {
  // Parse date range from query params
  const { startDate, endDate } = req.query;
  
  const dateFilter = {};
  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.$lte = new Date(endDate);
  }

  const matchStage = Object.keys(dateFilter).length > 0
    ? { createdAt: dateFilter }
    : {};

  const report = await Order.aggregate([
    {
      $match: matchStage
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
      $facet: {
        // Overall summary
        summary: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' },
              averageOrderValue: { $avg: '$totalAmount' },
              pendingOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.PENDING] }, 1, 0] }
              },
              approvedOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.APPROVED] }, 1, 0] }
              },
              processingOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.PROCESSING] }, 1, 0] }
              },
              shippedOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.SHIPPED] }, 1, 0] }
              },
              deliveredOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.DELIVERED] }, 1, 0] }
              },
              rejectedOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.REJECTED] }, 1, 0] }
              },
              cancelledOrders: {
                $sum: { $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.CANCELLED] }, 1, 0] }
              },
              pendingRevenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$orderStatus', ORDER_STATUS.PENDING] },
                    '$totalAmount',
                    0
                  ]
                }
              },
              completedRevenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$orderStatus', ORDER_STATUS.DELIVERED] },
                    '$totalAmount',
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalOrders: 1,
              totalRevenue: { $round: ['$totalRevenue', 2] },
              averageOrderValue: { $round: ['$averageOrderValue', 2] },
              pendingOrders: 1,
              approvedOrders: 1,
              processingOrders: 1,
              shippedOrders: 1,
              deliveredOrders: 1,
              rejectedOrders: 1,
              cancelledOrders: 1,
              pendingRevenue: { $round: ['$pendingRevenue', 2] },
              completedRevenue: { $round: ['$completedRevenue', 2] },
              fulfillmentRate: {
                $cond: [
                  { $gt: ['$totalOrders', 0] },
                  {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ['$deliveredOrders', '$totalOrders'] },
                          100
                        ]
                      },
                      2
                    ]
                  },
                  0
                ]
              }
            }
          }
        ],
        // By status
        byStatus: [
          {
            $group: {
              _id: '$orderStatus',
              count: { $sum: 1 },
              totalValue: { $sum: '$totalAmount' },
              averageValue: { $avg: '$totalAmount' }
            }
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: 1,
              totalValue: { $round: ['$totalValue', 2] },
              averageValue: { $round: ['$averageValue', 2] }
            }
          },
          {
            $sort: { count: -1 }
          }
        ],
        // Top wholesalers
        topWholesalers: [
          {
            $group: {
              _id: '$wholesaler',
              wholesalerName: { $first: '$wholesalerInfo.name' },
              businessName: { $first: '$wholesalerInfo.businessName' },
              email: { $first: '$wholesalerInfo.email' },
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$totalAmount' },
              averageOrderValue: { $avg: '$totalAmount' },
              completedOrders: {
                $sum: {
                  $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.DELIVERED] }, 1, 0]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              wholesalerId: '$_id',
              wholesalerName: 1,
              businessName: 1,
              email: 1,
              totalOrders: 1,
              totalSpent: { $round: ['$totalSpent', 2] },
              averageOrderValue: { $round: ['$averageOrderValue', 2] },
              completedOrders: 1
            }
          },
          {
            $sort: { totalSpent: -1 }
          },
          {
            $limit: 10
          }
        ],
        // Revenue by month (last 12 months)
        revenueByMonth: [
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' },
              deliveredOrders: {
                $sum: {
                  $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.DELIVERED] }, 1, 0]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              year: '$_id.year',
              month: '$_id.month',
              totalOrders: 1,
              totalRevenue: { $round: ['$totalRevenue', 2] },
              deliveredOrders: 1
            }
          },
          {
            $sort: { year: -1, month: -1 }
          },
          {
            $limit: 12
          }
        ],
        // Most ordered products
        topProducts: [
          {
            $unwind: '$items'
          },
          {
            $lookup: {
              from: 'products',
              localField: 'items.product',
              foreignField: '_id',
              as: 'productInfo'
            }
          },
          {
            $unwind: '$productInfo'
          },
          {
            $group: {
              _id: '$items.product',
              productName: { $first: '$productInfo.name' },
              sku: { $first: '$productInfo.sku' },
              category: { $first: '$productInfo.category' },
              totalQuantityOrdered: { $sum: '$items.quantity' },
              totalRevenue: { $sum: '$items.subtotal' },
              orderCount: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              productId: '$_id',
              productName: 1,
              sku: 1,
              category: 1,
              totalQuantityOrdered: 1,
              totalRevenue: { $round: ['$totalRevenue', 2] },
              orderCount: 1
            }
          },
          {
            $sort: { totalRevenue: -1 }
          },
          {
            $limit: 10
          }
        ]
      }
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    report: {
      summary: report[0].summary[0] || {},
      byStatus: report[0].byStatus || [],
      topWholesalers: report[0].topWholesalers || [],
      revenueByMonth: report[0].revenueByMonth || [],
      topProducts: report[0].topProducts || []
    },
    filters: {
      startDate: startDate || null,
      endDate: endDate || null
    },
    generatedAt: new Date()
  }, 'Order summary report generated successfully');
});

/**
 * @desc    Get product performance report
 * @route   GET /api/reports/product-performance
 * @access  Private/Admin
 */
export const getProductPerformanceReport = asyncHandler(async (req, res, next) => {
  const report = await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: [ORDER_STATUS.DELIVERED, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED] }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $lookup: {
        from: 'inventories',
        localField: 'items.product',
        foreignField: 'product',
        as: 'inventory'
      }
    },
    {
      $unwind: {
        path: '$inventory',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$items.product',
        productName: { $first: '$productInfo.name' },
        sku: { $first: '$productInfo.sku' },
        category: { $first: '$productInfo.category' },
        brand: { $first: '$productInfo.brand' },
        basePrice: { $first: '$productInfo.basePrice' },
        currentStock: { $first: '$inventory.availableQuantity' },
        totalQuantitySold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
        orderCount: { $sum: 1 },
        averageOrderQuantity: { $avg: '$items.quantity' }
      }
    },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        productName: 1,
        sku: 1,
        category: 1,
        brand: 1,
        basePrice: { $round: ['$basePrice', 2] },
        currentStock: { $ifNull: ['$currentStock', 0] },
        totalQuantitySold: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        orderCount: 1,
        averageOrderQuantity: { $round: ['$averageOrderQuantity', 2] },
        stockTurnoverRatio: {
          $cond: [
            { $and: [{ $gt: ['$currentStock', 0] }, { $gt: ['$totalQuantitySold', 0] }] },
            { $round: [{ $divide: ['$totalQuantitySold', '$currentStock'] }, 2] },
            0
          ]
        }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    report: {
      products: report,
      summary: {
        totalProducts: report.length,
        totalRevenue: report.reduce((sum, p) => sum + p.totalRevenue, 0),
        totalQuantitySold: report.reduce((sum, p) => sum + p.totalQuantitySold, 0)
      }
    },
    generatedAt: new Date()
  }, 'Product performance report generated successfully');
});
