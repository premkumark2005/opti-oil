// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  WHOLESALER: 'wholesaler',
  SUPPLIER: 'supplier'
};

// Raw Material Categories
export const RAW_MATERIAL_CATEGORIES = [
  'Seeds',
  'Nuts',
  'Fruits',
  'Grains',
  'Packaging',
  'Chemicals',
  'Other'
];

// Raw Material Units
export const RAW_MATERIAL_UNITS = [
  'kg',
  'litre'
];

// Raw Material Order Status
export const RAW_MATERIAL_ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Raw Material Status
export const RAW_MATERIAL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Supplier User Status
export const SUPPLIER_USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  INACTIVE: 'inactive'
};

// Raw Material Transaction Types
export const TRANSACTION_TYPES = {
  STOCK_IN: 'stock-in',
  STOCK_OUT: 'stock-out',
  ADJUSTMENT: 'adjustment'
};

// Order Status Badge Colors
export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

// Supplier Status Badge Colors
export const SUPPLIER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800'
};

// Material Status Badge Colors
export const MATERIAL_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800'
};

// Transaction Type Badge Colors
export const TRANSACTION_TYPE_COLORS = {
  'stock-in': 'bg-green-100 text-green-800',
  'stock-out': 'bg-red-100 text-red-800',
  'adjustment': 'bg-yellow-100 text-yellow-800'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Supplier Auth
  SUPPLIER_AUTH: {
    REGISTER: '/supplier-auth/register',
    LOGIN: '/supplier-auth/login',
    ME: '/supplier-auth/me',
    PROFILE: '/supplier-auth/profile',
    CHANGE_PASSWORD: '/supplier-auth/change-password'
  },
  
  // Raw Materials
  RAW_MATERIALS: {
    BASE: '/raw-materials',
    STATS: '/raw-materials/stats',
    BY_ID: (id) => `/raw-materials/${id}`
  },
  
  // Raw Material Orders
  RAW_MATERIAL_ORDERS: {
    BASE: '/raw-material-orders',
    BY_ID: (id) => `/raw-material-orders/${id}`,
    UPDATE_STATUS: (id) => `/raw-material-orders/${id}/status`,
    MARK_DELIVERED: (id) => `/raw-material-orders/${id}/deliver`,
    SUPPLIER_STATS: '/raw-material-orders/stats/supplier',
    ADMIN_STATS: '/raw-material-orders/stats/admin'
  },
  
  // Raw Material Inventory
  RAW_MATERIAL_INVENTORY: {
    BASE: '/raw-material-inventory',
    BY_ID: (id) => `/raw-material-inventory/${id}`,
    STOCK_IN: (id) => `/raw-material-inventory/${id}/stock-in`,
    STOCK_OUT: (id) => `/raw-material-inventory/${id}/stock-out`,
    ADJUST: (id) => `/raw-material-inventory/${id}/adjust`,
    REORDER_LEVEL: (id) => `/raw-material-inventory/${id}/reorder-level`,
    LOW_STOCK: '/raw-material-inventory/low-stock',
    STATS: '/raw-material-inventory/stats',
    TRANSACTIONS: (id) => `/raw-material-inventory/${id}/transactions`
  },
  
  // Admin Supplier Users
  ADMIN_SUPPLIER_USERS: {
    BASE: '/admin/supplier-users',
    BY_ID: (id) => `/admin/supplier-users/${id}`,
    APPROVE: (id) => `/admin/supplier-users/${id}/approve`,
    REJECT: (id) => `/admin/supplier-users/${id}/reject`,
    TOGGLE_STATUS: (id) => `/admin/supplier-users/${id}/toggle-status`,
    STATS: '/admin/supplier-users/stats'
  }
};

// Socket.IO Events
export const SOCKET_EVENTS = {
  RAW_MATERIAL_ORDER: 'raw_material_order',
  RAW_MATERIAL_DELIVERED: 'raw_material_delivered',
  SUPPLIER_APPROVED: 'supplier_approved',
  SUPPLIER_REJECTED: 'supplier_rejected'
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN: 'Password must be at least 6 characters long',
  PASSWORD_MISMATCH: 'Passwords do not match',
  PHONE_INVALID: 'Please enter a valid phone number',
  NUMBER_MIN: 'Value must be greater than 0',
  QUANTITY_EXCEEDS: 'Quantity exceeds available stock'
};

// Dashboard Widget Icons
export const DASHBOARD_ICONS = {
  TOTAL_MATERIALS: '📦',
  TOTAL_ORDERS: '🛒',
  PENDING_ORDERS: '⏳',
  COMPLETED_ORDERS: '✅',
  TOTAL_REVENUE: '💰',
  LOW_STOCK: '⚠️',
  ACTIVE_SUPPLIERS: '👥',
  INVENTORY_VALUE: '💵'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Date Format
export const DATE_FORMAT = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  TIME_ONLY: 'HH:mm:ss'
};

export default {
  USER_ROLES,
  RAW_MATERIAL_CATEGORIES,
  RAW_MATERIAL_UNITS,
  RAW_MATERIAL_ORDER_STATUS,
  RAW_MATERIAL_STATUS,
  SUPPLIER_USER_STATUS,
  TRANSACTION_TYPES,
  ORDER_STATUS_COLORS,
  SUPPLIER_STATUS_COLORS,
  MATERIAL_STATUS_COLORS,
  TRANSACTION_TYPE_COLORS,
  API_ENDPOINTS,
  SOCKET_EVENTS,
  VALIDATION_MESSAGES,
  DASHBOARD_ICONS,
  PAGINATION,
  DATE_FORMAT
};
