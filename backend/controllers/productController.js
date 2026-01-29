import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/response.js';
import { HTTP_STATUS, DEFAULTS } from '../config/constants.js';

/**
 * @desc    Get all products with search, filter, and pagination
 * @route   GET /api/products
 * @access  Private
 */
export const getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit) || DEFAULTS.LIMIT;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};

  // Search by product name
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { sku: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filter by brand
  if (req.query.brand) {
    filter.brand = { $regex: req.query.brand, $options: 'i' };
  }

  // Filter by active status
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  } else {
    // By default, only show active products
    filter.isActive = true;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    filter.basePrice = {};
    if (req.query.minPrice) {
      filter.basePrice.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.basePrice.$lte = parseFloat(req.query.maxPrice);
    }
  }

  // Get total count for pagination
  const total = await Product.countDocuments(filter);

  // Optimize query with lean() and select specific fields
  const products = await Product.find(filter)
    .select('name sku category description basePrice unit brand packagingSize image isActive')
    .populate('createdBy', 'name')
    .sort(req.query.sort || '-createdAt')
    .skip(skip)
    .limit(limit)
    .lean(); // Returns plain JavaScript objects for better performance

  // Get inventory for each product (optimized with single query)
  const productIds = products.map(p => p._id);
  const inventories = await Inventory.find({ 
    product: { $in: productIds } 
  })
    .select('product availableQuantity reservedQuantity reorderLevel')
    .lean();

  // Create inventory map for quick lookup
  const inventoryMap = {};
  inventories.forEach(inv => {
    inventoryMap[inv.product.toString()] = inv;
  });

  // Attach inventory to products
  const productsWithInventory = products.map(product => ({
    ...product,
    inventory: inventoryMap[product._id.toString()] || null,
    inStock: inventoryMap[product._id.toString()]?.availableQuantity > 0 || false
  }));

  sendPaginatedResponse(
    res,
    productsWithInventory,
    page,
    limit,
    total,
    'Products retrieved successfully'
  );
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Private
 */
export const getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!product) {
    return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
  }

  // Get inventory information
  const inventory = await Inventory.findOne({ product: id })
    .select('availableQuantity reservedQuantity reorderLevel lastStockIn lastStockOut');

  sendSuccess(res, HTTP_STATUS.OK, {
    product,
    inventory,
    inStock: inventory?.availableQuantity > 0 || false
  }, 'Product retrieved successfully');
});

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    category,
    description,
    basePrice,
    sku,
    unit,
    brand,
    packagingSize,
    specifications,
    reorderLevel
  } = req.body;

  // Check if SKU already exists
  if (sku) {
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return next(new AppError('Product with this SKU already exists', HTTP_STATUS.CONFLICT));
    }
  }

  // Handle uploaded image
  const imagePath = req.file ? `/uploads/products/${req.file.filename}` : undefined;

  const product = await Product.create({
    name,
    category,
    description,
    basePrice,
    sku,
    unit,
    brand,
    packagingSize,
    image: imagePath,
    specifications,
    createdBy: req.user.id
  });

  // Create initial inventory record
  await Inventory.create({
    product: product._id,
    availableQuantity: 0,
    reorderLevel: reorderLevel || DEFAULTS.LOW_STOCK_THRESHOLD,
    updatedBy: req.user.id
  });

  sendSuccess(res, HTTP_STATUS.CREATED, {
    product: await Product.findById(product._id).populate('createdBy', 'name email')
  }, 'Product created successfully');
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    category,
    description,
    basePrice,
    sku,
    unit,
    brand,
    packagingSize,
    specifications,
    isActive
  } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if SKU is being changed and if new SKU already exists
  if (sku && sku !== product.sku) {
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return next(new AppError('Product with this SKU already exists', HTTP_STATUS.CONFLICT));
    }
  }

  // Handle uploaded image
  if (req.file) {
    product.image = `/uploads/products/${req.file.filename}`;
  }

  // Update fields
  if (name) product.name = name;
  if (category) product.category = category;
  if (description) product.description = description;
  if (basePrice !== undefined) product.basePrice = basePrice;
  if (sku) product.sku = sku;
  if (unit) product.unit = unit;
  if (brand !== undefined) product.brand = brand;
  if (packagingSize !== undefined) product.packagingSize = packagingSize;
  if (specifications) product.specifications = specifications;
  if (isActive !== undefined) product.isActive = isActive;
  
  product.modifiedBy = req.user.id;
  await product.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    product: await Product.findById(product._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
  }, 'Product updated successfully');
});

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
  }

  // Soft delete by marking as inactive
  product.isActive = false;
  product.modifiedBy = req.user.id;
  await product.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    product
  }, 'Product deactivated successfully');
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Private
 */
export const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit) || DEFAULTS.LIMIT;
  const skip = (page - 1) * limit;

  const filter = {
    category,
    isActive: true
  };

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .select('name sku description basePrice unit brand packagingSize image')
    .sort('name')
    .skip(skip)
    .limit(limit)
    .lean();

  // Get inventory for products
  const productIds = products.map(p => p._id);
  const inventories = await Inventory.find({ 
    product: { $in: productIds } 
  })
    .select('product availableQuantity')
    .lean();

  const inventoryMap = {};
  inventories.forEach(inv => {
    inventoryMap[inv.product.toString()] = inv;
  });

  const productsWithInventory = products.map(product => ({
    ...product,
    inventory: inventoryMap[product._id.toString()] || null,
    inStock: inventoryMap[product._id.toString()]?.availableQuantity > 0 || false
  }));

  sendPaginatedResponse(
    res,
    productsWithInventory,
    page,
    limit,
    total,
    `Products in ${category} category retrieved successfully`
  );
});

/**
 * @desc    Get all product categories
 * @route   GET /api/products/categories/list
 * @access  Private
 */
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Product.distinct('category', { isActive: true });

  sendSuccess(res, HTTP_STATUS.OK, {
    count: categories.length,
    categories: categories.sort()
  }, 'Categories retrieved successfully');
});

/**
 * @desc    Get all product brands
 * @route   GET /api/products/brands/list
 * @access  Private
 */
export const getBrands = asyncHandler(async (req, res, next) => {
  const brands = await Product.distinct('brand', { 
    isActive: true,
    brand: { $ne: null, $ne: '' }
  });

  sendSuccess(res, HTTP_STATUS.OK, {
    count: brands.length,
    brands: brands.sort()
  }, 'Brands retrieved successfully');
});

/**
 * @desc    Get product statistics
 * @route   GET /api/products/stats
 * @access  Private/Admin
 */
export const getProductStats = asyncHandler(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $facet: {
        categoryDistribution: [
          {
            $match: { isActive: true }
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              avgPrice: { $avg: '$basePrice' },
              minPrice: { $min: '$basePrice' },
              maxPrice: { $max: '$basePrice' }
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
              totalProducts: { $sum: 1 },
              activeProducts: {
                $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
              },
              inactiveProducts: {
                $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
              },
              avgPrice: { $avg: '$basePrice' }
            }
          }
        ]
      }
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: stats[0]
  }, 'Product statistics retrieved successfully');
});
