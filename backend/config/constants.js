// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  WHOLESALER: 'wholesaler'
};

// User Status
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Transaction Types
export const TRANSACTION_TYPES = {
  STOCK_IN: 'stock-in',
  STOCK_OUT: 'stock-out',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return'
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  VEGETABLE_OIL: 'Vegetable Oil',
  SUNFLOWER_OIL: 'Sunflower Oil',
  OLIVE_OIL: 'Olive Oil',
  COCONUT_OIL: 'Coconut Oil',
  PALM_OIL: 'Palm Oil',
  MUSTARD_OIL: 'Mustard Oil',
  GROUNDNUT_OIL: 'Groundnut Oil',
  SOYBEAN_OIL: 'Soybean Oil',
  OTHER: 'Other'
};

// Units of Measurement
export const UNITS = {
  LITER: 'L',
  MILLILITER: 'mL',
  KILOGRAM: 'kg',
  GRAM: 'g',
  PIECE: 'pcs',
  BOTTLE: 'bottle',
  CARTON: 'carton'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low-stock',
  ORDER_UPDATE: 'order-update',
  NEW_ORDER: 'new-order',
  ACCOUNT_APPROVED: 'account-approved',
  ACCOUNT_REJECTED: 'account-rejected'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Default Values
export const DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  LOW_STOCK_THRESHOLD: parseInt(process.env.LOW_STOCK_THRESHOLD) || 100
};
