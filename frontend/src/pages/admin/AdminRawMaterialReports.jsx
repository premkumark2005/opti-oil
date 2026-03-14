import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import rawMaterialOrderService from '../../services/rawMaterialOrderService';
import rawMaterialInventoryService from '../../services/rawMaterialInventoryService';
import rawMaterialService from '../../services/rawMaterialService';

const AdminRawMaterialReports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalMaterials: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
    topSuppliers: []
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await rawMaterialOrderService.getAll({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const ordersData = ordersResponse.data.orders || [];
      setOrders(ordersData);

      // Fetch inventory
      const inventoryResponse = await rawMaterialInventoryService.getAll();
      const inventoryData = inventoryResponse.data.inventories || [];
      setInventory(inventoryData);

      // Fetch materials
      const materialsResponse = await rawMaterialService.getAll();
      const materialsData = materialsResponse.data.rawMaterials || [];
      setMaterials(materialsData);

      // Calculate stats
      calculateStats(ordersData, inventoryData, materialsData);
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData, inventoryData, materialsData) => {
    // Order stats
    const totalOrders = ordersData.length;
    const deliveredOrders = ordersData.filter(o => o.status === 'delivered').length;
    const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
    const totalSpent = ordersData
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Inventory stats
    const lowStockItems = inventoryData.filter(item => item.isLowStock).length;
    const totalInventoryValue = inventoryData.reduce((sum, item) => {
      const material = materialsData.find(m => m._id === item.rawMaterial?._id);
      return sum + (item.quantity * (material?.pricePerUnit || 0));
    }, 0);

    // Supplier stats
    const supplierMap = new Map();
    ordersData.forEach(order => {
      if (order.supplier && order.status !== 'cancelled') {
        const supplierId = order.supplier._id;
        const existing = supplierMap.get(supplierId) || {
          name: order.supplier.businessName || order.supplier.name,
          orders: 0,
          totalAmount: 0
        };
        supplierMap.set(supplierId, {
          ...existing,
          orders: existing.orders + 1,
          totalAmount: existing.totalAmount + (order.totalPrice || 0)
        });
      }
    });

    const topSuppliers = Array.from(supplierMap.entries())
      .map(([id, data]) => ({ ...data, id }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    setStats({
      totalOrders,
      totalSpent,
      deliveredOrders,
      pendingOrders,
      totalMaterials: materialsData.length,
      totalInventoryValue,
      lowStockItems,
      topSuppliers
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const headers = ['Order Number', 'Date', 'Supplier', 'Material', 'Quantity', 'Unit Price', 'Total Price', 'Status'];
    const csvData = orders.map(order => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString(),
      order.supplier?.businessName || 'N/A',
      order.rawMaterial?.materialType || order.rawMaterial?.name || 'N/A',
      order.quantityOrdered,
      `₹${order.pricePerUnit?.toFixed(2) || 0}`,
      `₹${order.totalPrice?.toFixed(2) || 0}`,
      order.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw-material-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const exportInventoryToCSV = () => {
    if (inventory.length === 0) {
      toast.warning('No inventory data to export');
      return;
    }

    const headers = ['Material', 'Category', 'Quantity', 'Unit', 'Reorder Level', 'Status', 'Last Stock In'];
    const csvData = inventory.map(item => [
      item.materialType || item.rawMaterial?.materialType || item.rawMaterial?.name || 'N/A',
      item.category || item.rawMaterial?.category || 'N/A',
      item.quantity,
      item.unit || item.rawMaterial?.unit || 'units',
      item.reorderLevel,
      item.isLowStock ? 'Low Stock' : 'Normal',
      item.lastStockIn ? new Date(item.lastStockIn).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw-material-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Inventory report exported successfully');
  };

  // Calculate material-wise summary
  const getMaterialSummary = () => {
    const materialMap = new Map();
    
    orders.forEach(order => {
      if (order.rawMaterial && order.status !== 'cancelled') {
        const materialId = order.rawMaterial.materialType || order.rawMaterial._id;
        const existing = materialMap.get(materialId) || {
          name: order.rawMaterial.materialType || order.rawMaterial.name,
          category: order.rawMaterial.category,
          unit: order.rawMaterial.unit,
          totalOrdered: 0,
          totalSpent: 0,
          orders: 0
        };
        materialMap.set(materialId, {
          ...existing,
          totalOrdered: existing.totalOrdered + order.quantityOrdered,
          totalSpent: existing.totalSpent + (order.totalPrice || 0),
          orders: existing.orders + 1
        });
      }
    });

    return Array.from(materialMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);
  };

  const materialSummary = getMaterialSummary();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Raw Material Reports</h1>
        <p className="text-gray-600">Comprehensive analysis of raw material procurement and inventory</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📥 Export Orders
          </button>
          <button
            onClick={exportInventoryToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📥 Export Inventory
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-500 text-sm mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
              <div className="text-xs text-gray-400 mt-1">in selected period</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-500 text-sm mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-green-600">₹{stats.totalSpent.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">procurement cost</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-500 text-sm mb-1">Delivered Orders</div>
              <div className="text-2xl font-bold text-blue-600">{stats.deliveredOrders}</div>
              <div className="text-xs text-gray-400 mt-1">completed orders</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-500 text-sm mb-1">Pending Orders</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              <div className="text-xs text-gray-400 mt-1">awaiting delivery</div>
            </div>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-500 text-sm mb-1">Total Materials</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalMaterials}</div>
              <div className="text-xs text-gray-400 mt-1">available types</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-500 text-sm mb-1">Inventory Value</div>
              <div className="text-2xl font-bold text-purple-600">₹{stats.totalInventoryValue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">current stock value</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-500 text-sm mb-1">In Stock</div>
              <div className="text-2xl font-bold text-green-600">{inventory.length}</div>
              <div className="text-xs text-gray-400 mt-1">inventory items</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-500 text-sm mb-1">Low Stock Items</div>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
              <div className="text-xs text-gray-400 mt-1">needs reorder</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Material-wise Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Material-wise Procurement</h2>
              {materialSummary.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders in selected period</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {materialSummary.map((material, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{material.name}</div>
                          <div className="text-xs text-gray-500">{material.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">₹{material.totalSpent.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{material.orders} orders</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Total Ordered:</span>
                        <span className="font-medium">{material.totalOrdered} {material.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Avg Price:</span>
                        <span className="font-medium">₹{(material.totalSpent / material.totalOrdered).toFixed(2)}/{material.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Suppliers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Suppliers</h2>
              {stats.topSuppliers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No supplier data available</p>
              ) : (
                <div className="space-y-3">
                  {stats.topSuppliers.map((supplier, index) => (
                    <div key={supplier.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-xs text-gray-500">{supplier.orders} orders</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">₹{supplier.totalAmount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">total value</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(supplier.totalAmount / stats.totalSpent) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current Inventory Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Inventory Status</h2>
            {inventory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No inventory items found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Stock In</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.rawMaterial?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.rawMaterial?.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.quantity} {item.rawMaterial?.unit || 'units'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.reorderLevel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.isLowStock
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.isLowStock ? 'Low Stock' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.lastStockIn ? new Date(item.lastStockIn).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRawMaterialReports;
