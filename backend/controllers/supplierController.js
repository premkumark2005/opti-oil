import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/response.js';
import { HTTP_STATUS, DEFAULTS } from '../config/constants.js';

/**
 * @desc    Add a new supplier
 * @route   POST /api/suppliers
 * @access  Private/Admin
 */
export const addSupplier = asyncHandler(async (req, res, next) => {
  const {
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    rating,
    notes,
    suppliedProducts
  } = req.body;

  // Check if supplier with same name exists
  const existingSupplier = await Supplier.findOne({ name });
  if (existingSupplier) {
    return next(new AppError('Supplier with this name already exists', HTTP_STATUS.CONFLICT));
  }

  // Validate supplied products if provided
  if (suppliedProducts && suppliedProducts.length > 0) {
    const products = await Product.find({ _id: { $in: suppliedProducts } });
    if (products.length !== suppliedProducts.length) {
      return next(new AppError('One or more product IDs are invalid', HTTP_STATUS.BAD_REQUEST));
    }
  }

  const supplier = await Supplier.create({
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    rating,
    notes,
    suppliedProducts: suppliedProducts || [],
    createdBy: req.user.id
  });

  sendSuccess(res, HTTP_STATUS.CREATED, {
    supplier: await Supplier.findById(supplier._id)
      .populate('suppliedProducts', 'name sku category')
      .populate('createdBy', 'name email')
  }, 'Supplier added successfully');
});

/**
 * @desc    Update supplier
 * @route   PUT /api/suppliers/:id
 * @access  Private/Admin
 */
export const updateSupplier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    paymentTerms,
    isActive,
    rating,
    notes
  } = req.body;

  const supplier = await Supplier.findById(id);

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if name is being changed and if new name already exists
  if (name && name !== supplier.name) {
    const existingSupplier = await Supplier.findOne({ name });
    if (existingSupplier) {
      return next(new AppError('Supplier with this name already exists', HTTP_STATUS.CONFLICT));
    }
  }

  // Update fields
  if (name) supplier.name = name;
  if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
  if (email !== undefined) supplier.email = email;
  if (phone) supplier.phone = phone;
  if (address) supplier.address = address;
  if (taxId !== undefined) supplier.taxId = taxId;
  if (paymentTerms) supplier.paymentTerms = paymentTerms;
  if (isActive !== undefined) supplier.isActive = isActive;
  if (rating !== undefined) supplier.rating = rating;
  if (notes !== undefined) supplier.notes = notes;

  await supplier.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    supplier: await Supplier.findById(supplier._id)
      .populate('suppliedProducts', 'name sku category')
      .populate('createdBy', 'name email')
  }, 'Supplier updated successfully');
});

/**
 * @desc    Get all suppliers
 * @route   GET /api/suppliers
 * @access  Private/Admin
 */
export const getAllSuppliers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit) || DEFAULTS.LIMIT;
  const skip = (page - 1) * limit;

  const filter = {};

  // Filter by active status
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  // Search by name
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  // Filter by rating
  if (req.query.rating) {
    filter.rating = parseInt(req.query.rating);
  }

  const total = await Supplier.countDocuments(filter);

  const suppliers = await Supplier.find(filter)
    .populate('suppliedProducts', 'name sku category')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendPaginatedResponse(res, suppliers, page, limit, total, 'Suppliers retrieved successfully');
});

/**
 * @desc    Get single supplier
 * @route   GET /api/suppliers/:id
 * @access  Private/Admin
 */
export const getSupplier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const supplier = await Supplier.findById(id)
    .populate('suppliedProducts', 'name sku category basePrice')
    .populate('createdBy', 'name email');

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  sendSuccess(res, HTTP_STATUS.OK, {
    supplier
  }, 'Supplier retrieved successfully');
});

/**
 * @desc    Link products to supplier
 * @route   PUT /api/suppliers/:id/products
 * @access  Private/Admin
 */
export const linkProductsToSupplier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Please provide an array of product IDs', HTTP_STATUS.BAD_REQUEST));
  }

  const supplier = await Supplier.findById(id);

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  // Validate all product IDs
  const products = await Product.find({ _id: { $in: productIds } });
  if (products.length !== productIds.length) {
    return next(new AppError('One or more product IDs are invalid', HTTP_STATUS.BAD_REQUEST));
  }

  // Add products to supplier (avoid duplicates)
  const uniqueProductIds = [...new Set([...supplier.suppliedProducts.map(p => p.toString()), ...productIds])];
  supplier.suppliedProducts = uniqueProductIds;
  await supplier.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    supplier: await Supplier.findById(supplier._id)
      .populate('suppliedProducts', 'name sku category')
  }, 'Products linked to supplier successfully');
});

/**
 * @desc    Remove products from supplier
 * @route   DELETE /api/suppliers/:id/products
 * @access  Private/Admin
 */
export const removeProductsFromSupplier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Please provide an array of product IDs', HTTP_STATUS.BAD_REQUEST));
  }

  const supplier = await Supplier.findById(id);

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  // Remove products from supplier
  supplier.suppliedProducts = supplier.suppliedProducts.filter(
    p => !productIds.includes(p.toString())
  );
  await supplier.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    supplier: await Supplier.findById(supplier._id)
      .populate('suppliedProducts', 'name sku category')
  }, 'Products removed from supplier successfully');
});

/**
 * @desc    Delete supplier
 * @route   DELETE /api/suppliers/:id
 * @access  Private/Admin
 */
export const deleteSupplier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const supplier = await Supplier.findById(id);

  if (!supplier) {
    return next(new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND));
  }

  // Soft delete by marking as inactive instead of hard delete
  supplier.isActive = false;
  await supplier.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    supplier
  }, 'Supplier deactivated successfully');
});

/**
 * @desc    Get suppliers for a specific product
 * @route   GET /api/suppliers/product/:productId
 * @access  Private/Admin
 */
export const getSuppliersByProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
  }

  const suppliers = await Supplier.find({
    suppliedProducts: productId,
    isActive: true
  })
    .populate('createdBy', 'name email')
    .sort({ name: 1 });

  sendSuccess(res, HTTP_STATUS.OK, {
    product: {
      id: product._id,
      name: product.name,
      sku: product.sku
    },
    count: suppliers.length,
    suppliers
  }, 'Suppliers retrieved successfully');
});

/**
 * @desc    Get supplier statistics
 * @route   GET /api/suppliers/stats
 * @access  Private/Admin
 */
export const getSupplierStats = asyncHandler(async (req, res, next) => {
  const stats = await Supplier.aggregate([
    {
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: {
                $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
              },
              inactive: {
                $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
              }
            }
          }
        ],
        ratingDistribution: [
          {
            $match: { rating: { $exists: true } }
          },
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: -1 }
          }
        ],
        topSuppliers: [
          {
            $match: { isActive: true }
          },
          {
            $addFields: {
              productCount: { $size: '$suppliedProducts' }
            }
          },
          {
            $sort: { productCount: -1 }
          },
          {
            $limit: 5
          },
          {
            $project: {
              name: 1,
              productCount: 1,
              rating: 1
            }
          }
        ]
      }
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: stats[0]
  }, 'Supplier statistics retrieved successfully');
});
