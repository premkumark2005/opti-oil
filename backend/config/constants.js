// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  WHOLESALER: 'wholesaler',
  SUPPLIER: 'supplier'
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
  ACCOUNT_REJECTED: 'account-rejected',
  RAW_MATERIAL_ORDER: 'raw-material-order',
  RAW_MATERIAL_DELIVERED: 'raw-material-delivered'
};

// Raw Material Categories
export const RAW_MATERIAL_CATEGORIES = {
  SEEDS: 'Seeds',
  NUTS: 'Nuts',
  FRUITS: 'Fruits',
  GRAINS: 'Grains',
  PACKAGING: 'Packaging',
  CHEMICALS: 'Chemicals',
  OTHER: 'Other'
};

// Predefined Material Types (for inventory consolidation)
export const MATERIAL_TYPES = {
  // Seeds
  GROUNDNUT: 'Groundnut',
  SUNFLOWER_SEEDS: 'Sunflower Seeds',
  SESAME_SEEDS: 'Sesame Seeds',
  FLAX_SEEDS: 'Flax Seeds',
  MUSTARD_SEEDS: 'Mustard Seeds',
  COTTON_SEEDS: 'Cotton Seeds',
  
  // Nuts
  ALMOND: 'Almond',
  CASHEW: 'Cashew',
  WALNUT: 'Walnut',
  PISTACHIO: 'Pistachio',
  
  // Fruits
  OLIVE: 'Olive',
  COCONUT: 'Coconut',
  PALM_FRUIT: 'Palm Fruit',
  AVOCADO: 'Avocado',
  
  // Grains
  CORN: 'Corn',
  RICE_BRAN: 'Rice Bran',
  WHEAT_GERM: 'Wheat Germ',
  SOYBEAN: 'Soybean',
  
  // Packaging
  PLASTIC_BOTTLES: 'Plastic Bottles',
  GLASS_BOTTLES: 'Glass Bottles',
  LABELS: 'Labels',
  CAPS: 'Caps',
  CARTONS: 'Cartons',
  
  // Chemicals
  PRESERVATIVES: 'Preservatives',
  ANTIOXIDANTS: 'Antioxidants',
  FLAVORING: 'Flavoring',
  
  // Other
  OTHER: 'Other'
};

// Raw Material Units
export const RAW_MATERIAL_UNITS = {
  KG: 'kg',
  LITRE: 'litre'
};

// Raw Material Order Status
export const RAW_MATERIAL_ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
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
