# Supplier Portal & Raw Material Management - Implementation Guide

## Overview
This document contains all the remaining frontend components, pages, and updates needed to complete the supplier portal and raw material management system.

---

## FRONTEND IMPLEMENTATION CHECKLIST

### ✅ Completed
1. Backend models (RawMaterial, RawMaterialOrder, RawMaterialInventory, RawMaterialTransaction)
2. Backend controllers (supplier auth, raw materials, orders, inventory)
3. Backend routes integrated into app.js
4. Validation middleware
5. Frontend services (all 5 services created)
6. Supplier authentication pages (login/signup)
7. Supplier sidebar component
8. Supplier layout component

### 🔄 Remaining Frontend Files to Create

#### 1. Supplier Dashboard (SupplierDashboard.jsx)
**Location:** `frontend/src/pages/supplier/SupplierDashboard.jsx`

**Features:**
- Total raw materials listed widget
- Total orders received widget
- Pending orders widget
- Completed orders widget
- Revenue chart
- Recent orders table

**Key Code:**
```jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import rawMaterialService from '../../services/rawMaterialService';
import rawMaterialOrderService from '../../services/rawMaterialOrderService';

const SupplierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [materialStats, orderStatsData] = await Promise.all([
        rawMaterialService.getStats(),
        rawMaterialOrderService.getSupplierStats()
      ]);
      setStats(materialStats.data.stats);
      setOrderStats(orderStatsData.data.stats);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Widget components and charts here
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Supplier Dashboard</h1>
      {/* Widgets grid, charts, recent orders table */}
    </div>
  );
};
```

#### 2. Supplier Raw Materials Page (SupplierRawMaterials.jsx)
**Location:** `frontend/src/pages/supplier/SupplierRawMaterials.jsx`

**Features:**
- List all raw materials (created by supplier)
- Create new raw material modal
- Edit raw material
- Delete raw material
- Filter by category, status
- Search functionality

#### 3. Supplier Orders Page (SupplierOrders.jsx)
**Location:** `frontend/src/pages/supplier/SupplierOrders.jsx`

**Features:**
- View all orders received from admin
- Filter by status (pending/confirmed/delivered)
- Update order status
- Mark order as delivered
- Order details modal

#### 4. Supplier Reports Page (SupplierReports.jsx)
**Location:** `frontend/src/pages/supplier/SupplierReports.jsx`

**Features:**
- Total materials sold chart
- Total orders received chart
- Pending deliveries chart
- Revenue from raw materials chart
- Export to PDF/Excel

#### 5. Supplier Profile Page (SupplierProfile.jsx)
**Location:** `frontend/src/pages/supplier/SupplierProfile.jsx`

**Features:**
- View profile details
- Edit profile (name, phone, company name, address)
- Change password

---

### Admin Side Pages

#### 6. Admin Supplier Management (AdminSupplierManagement.jsx)
**Location:** `frontend/src/pages/admin/AdminSupplierManagement.jsx`

**Features:**
- List all suppliers
- Filter by status (pending/approved/rejected)
- Approve supplier
- Reject supplier with reason
- Deactivate/activate supplier
- View supplier details

#### 7. Admin Raw Material Ordering (AdminRawMaterialOrdering.jsx)
**Location:** `frontend/src/pages/admin/AdminRawMaterialOrdering.jsx`

**Features:**
- View all raw materials from all suppliers
- Filter by supplier
- Place raw material order
- Order form modal

#### 8. Admin Raw Material Inventory (AdminRawMaterialInventory.jsx)
**Location:** `frontend/src/pages/admin/AdminRawMaterialInventory.jsx`

**Features:**
- View raw material inventory
- Stock in operation
- Stock out operation
- Adjust inventory
- Update reorder level
- View low stock items
- Transaction history

---

## APP.JSX ROUTING UPDATES

Add these routes to **frontend/src/App.jsx**:

```jsx
// Import supplier pages
import SupplierSignup from './pages/supplier/SupplierSignup';
import SupplierLogin from './pages/supplier/SupplierLogin';
import SupplierLayout from './pages/supplier/SupplierLayout';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierRawMaterials from './pages/supplier/SupplierRawMaterials';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierReports from './pages/supplier/SupplierReports';
import SupplierProfile from './pages/supplier/SupplierProfile';

// Import admin supplier pages
import AdminSupplierManagement from './pages/admin/AdminSupplierManagement';
import AdminRawMaterialOrdering from './pages/admin/AdminRawMaterialOrdering';
import AdminRawMaterialInventory from './pages/admin/AdminRawMaterialInventory';

// In the Routes section, add:

{/* Supplier Routes */}
<Route path="/supplier/signup" element={<SupplierSignup />} />
<Route path="/supplier/login" element={<SupplierLogin />} />

{/* Protected Supplier Routes */}
<Route
  path="/supplier"
  element={
    <PrivateRoute allowedRoles={['supplier']}>
      <SupplierLayout />
    </PrivateRoute>
  }
>
  <Route path="dashboard" element={<SupplierDashboard />} />
  <Route path="raw-materials" element={<SupplierRawMaterials />} />
  <Route path="orders" element={<SupplierOrders />} />
  <Route path="reports" element={<SupplierReports />} />
  <Route path="profile" element={<SupplierProfile />} />
</Route>

{/* Admin Supplier Management Routes */}
<Route path="supplier-management" element={<AdminSupplierManagement />} />
<Route path="raw-material-ordering" element={<AdminRawMaterialOrdering />} />
<Route path="raw-material-inventory" element={<AdminRawMaterialInventory />} />
```

---

## ADMIN SIDEBAR UPDATE

Update **frontend/src/components/Sidebar.jsx** (Admin sidebar):

Add these menu items in the admin navigation:

```jsx
{
  title: 'Supplier Management',
  path: '/admin/supplier-management',
  icon: <UsersIcon />
},
{
  title: 'Raw Material Ordering',
  path: '/admin/raw-material-ordering',
  icon: <ShoppingCartIcon />
},
{
  title: 'Raw Material Inventory',
  path: '/admin/raw-material-inventory',
  icon: <CubeIcon />
}
```

---

## AUTHCONTEXT UPDATES

Update **frontend/src/context/AuthContext.jsx** to support supplier role:

```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
```

---

## PRIVATEROUTE COMPONENT UPDATE

Update **frontend/src/components/PrivateRoute.jsx** to handle supplier role:

```jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to appropriate login based on role
    if (allowedRoles?.includes('supplier')) {
      return <Navigate to="/supplier/login" />;
    }
    return <Navigate to="/login" />;
  }

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
```

---

## CONSTANTS FILE

Create **frontend/src/constants/rawMaterialConstants.js**:

```js
export const RAW_MATERIAL_CATEGORIES = [
  'Seeds',
  'Nuts',
  'Fruits',
  'Grains',
  'Packaging',
  'Chemicals',
  'Other'
];

export const RAW_MATERIAL_UNITS = ['kg', 'litre'];

export const RAW_MATERIAL_ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};
```

---

## SOCKET.IO INTEGRATION

Update **frontend/src/hooks/useSocket.js** to handle supplier events:

```js
// Add these event listeners in the useSocket hook:

socket.on('raw_material_order', (data) => {
  console.log('New raw material order:', data);
  // Show notification
  // Refetch orders list if on orders page
});

socket.on('raw_material_delivered', (data) => {
  console.log('Raw material delivered:', data);
  // Show notification
});
```

---

## TESTING CHECKLIST

### Supplier Portal Testing
1. ✅ Supplier can register
2. ✅ Supplier receives pending status
3. ✅ Admin can approve supplier
4. ✅ Supplier can login after approval
5. ✅ Supplier can create raw materials
6. ✅ Supplier can view/edit/delete their raw materials
7. ✅ Supplier can view orders
8. ✅ Supplier can update order status
9. ✅ Supplier can mark order as delivered
10. ✅ Inventory updates when order is delivered

### Admin Testing
1. ✅ Admin can view all suppliers
2. ✅ Admin can approve/reject suppliers
3. ✅ Admin can view all raw materials
4. ✅ Admin can place raw material orders
5. ✅ Admin can view raw material inventory
6. ✅ Admin can perform stock operations

---

## API ENDPOINTS REFERENCE

### Supplier Auth
- POST `/api/supplier-auth/register` - Register supplier
- POST `/api/supplier-auth/login` - Login supplier
- GET `/api/supplier-auth/me` - Get profile
- PUT `/api/supplier-auth/profile` - Update profile
- PUT `/api/supplier-auth/change-password` - Change password

### Raw Materials
- POST `/api/raw-materials` - Create (Supplier)
- GET `/api/raw-materials` - Get all
- GET `/api/raw-materials/:id` - Get by ID
- PUT `/api/raw-materials/:id` - Update (Supplier)
- DELETE `/api/raw-materials/:id` - Delete (Supplier)
- GET `/api/raw-materials/stats/overview` - Get stats (Supplier)

### Raw Material Orders
- POST `/api/raw-material-orders` - Create (Admin)
- GET `/api/raw-material-orders` - Get all
- GET `/api/raw-material-orders/:id` - Get by ID
- PUT `/api/raw-material-orders/:id/status` - Update status (Supplier)
- PUT `/api/raw-material-orders/:id/deliver` - Mark delivered (Supplier)
- GET `/api/raw-material-orders/stats/overview` - Supplier stats
- GET `/api/raw-material-orders/admin/stats` - Admin stats

### Raw Material Inventory
- GET `/api/raw-material-inventory` - Get all (Admin)
- GET `/api/raw-material-inventory/:id` - Get by ID (Admin)
- POST `/api/raw-material-inventory/:id/stock-in` - Stock in (Admin)
- POST `/api/raw-material-inventory/:id/stock-out` - Stock out (Admin)
- POST `/api/raw-material-inventory/:id/adjust` - Adjust (Admin)
- PUT `/api/raw-material-inventory/:id/reorder-level` - Update reorder level (Admin)
- GET `/api/raw-material-inventory/low-stock` - Get low stock (Admin)
- GET `/api/raw-material-inventory/stats/overview` - Get stats (Admin)

### Supplier Management (Admin)
- GET `/api/admin/supplier-users` - Get all suppliers
- GET `/api/admin/supplier-users/:id` - Get supplier by ID
- PUT `/api/admin/supplier-users/:id/approve` - Approve supplier
- PUT `/api/admin/supplier-users/:id/reject` - Reject supplier
- PUT `/api/admin/supplier-users/:id/toggle-status` - Toggle status
- DELETE `/api/admin/supplier-users/:id` - Delete supplier
- GET `/api/admin/supplier-users/stats/overview` - Get stats

---

## NEXT STEPS

1. Create all remaining frontend pages (8 pages total)
2. Update App.jsx with routing
3. Update admin Sidebar.jsx with new menu items
4. Update AuthContext to support supplier role
5. Update PrivateRoute component
6. Create constants file
7. Test all functionality end-to-end
8. Deploy and verify

---

## FILE STRUCTURE SUMMARY

```
backend/
├── models/
│   ├── RawMaterial.js ✅
│   ├── RawMaterialOrder.js ✅
│   ├── RawMaterialInventory.js ✅
│   └── RawMaterialTransaction.js ✅
├── controllers/
│   ├── supplierAuthController.js ✅
│   ├── adminSupplierUserController.js ✅
│   ├── rawMaterialController.js ✅
│   ├── rawMaterialOrderController.js ✅
│   └── rawMaterialInventoryController.js ✅
├── routes/
│   ├── supplierAuthRoutes.js ✅
│   ├── adminSupplierUserRoutes.js ✅
│   ├── rawMaterialRoutes.js ✅
│   ├── rawMaterialOrderRoutes.js ✅
│   └── rawMaterialInventoryRoutes.js ✅
└── validators/
    ├── supplierValidation.js ✅
    ├── rawMaterialValidation.js ✅
    └── rawMaterialOrderValidation.js ✅

frontend/
├── services/
│   ├── supplierAuthService.js ✅
│   ├── rawMaterialService.js ✅
│   ├── rawMaterialOrderService.js ✅
│   ├── rawMaterialInventoryService.js ✅
│   └── adminSupplierUserService.js ✅
├── pages/
│   ├── supplier/
│   │   ├── SupplierSignup.jsx ✅
│   │   ├── SupplierLogin.jsx ✅
│   │   ├── SupplierLayout.jsx ✅
│   │   ├── SupplierDashboard.jsx 🔄
│   │   ├── SupplierRawMaterials.jsx 🔄
│   │   ├── SupplierOrders.jsx 🔄
│   │   ├── SupplierReports.jsx 🔄
│   │   └── SupplierProfile.jsx 🔄
│   └── admin/
│       ├── AdminSupplierManagement.jsx 🔄
│       ├── AdminRawMaterialOrdering.jsx 🔄
│       └── AdminRawMaterialInventory.jsx 🔄
├── components/
│   └── SupplierSidebar.jsx ✅
└── constants/
    └── rawMaterialConstants.js 🔄
```

✅ = Completed
🔄 = Needs to be created

---

This completes the backend implementation. The frontend pages listed above need to be created to complete the full system. Each page should follow the existing design patterns in your project and use the services we've created.
