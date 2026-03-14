import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import rawMaterialOrderService from '../../services/rawMaterialOrderService';
import rawMaterialService from '../../services/rawMaterialService';

const SupplierReports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalMaterials: 0,
    activeMaterials: 0
  });
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);

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

      // Fetch materials
      const materialsResponse = await rawMaterialService.getAll();
      const materialsData = materialsResponse.data.rawMaterials || [];
      setMaterials(materialsData);

      // Calculate stats
      const totalOrders = ordersData.length;
      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
      const deliveredOrders = ordersData.filter(o => o.status === 'delivered').length;
      const totalRevenue = ordersData
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        totalMaterials: materialsData.length,
        activeMaterials: materialsData.filter(m => m.status === 'active').length
      });
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Order ID', 'Material', 'Quantity', 'Total Price', 'Status', 'Order Date'].join(','),
      ...orders.map(order => [
        order.orderNumber || order._id,
        order.rawMaterial?.name || 'N/A',
        order.quantityOrdered || 0,
        order.totalPrice || 0,
        order.status,
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplier-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View your business performance and insights</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <span>📊</span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Date Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Filter by Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <p className="text-blue-100 text-sm mt-1">All time orders</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-green-100 text-sm mt-1">From delivered orders</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Pending Orders</h3>
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-3xl font-bold">{stats.pendingOrders}</p>
          <p className="text-yellow-100 text-sm mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Delivered Orders</h3>
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-3xl font-bold">{stats.deliveredOrders}</p>
          <p className="text-purple-100 text-sm mt-1">Successfully completed</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Total Materials</h3>
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalMaterials}</p>
          <p className="text-indigo-100 text-sm mt-1">In your catalog</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Active Materials</h3>
            <span className="text-3xl">🟢</span>
          </div>
          <p className="text-3xl font-bold">{stats.activeMaterials}</p>
          <p className="text-teal-100 text-sm mt-1">Currently available</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl mb-2 block">📭</span>
              No orders found for the selected period
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber || order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.rawMaterial?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantityOrdered} {order.rawMaterial?.unit || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{order.totalPrice?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top Materials */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Materials Overview</h2>
        <div className="space-y-4">
          {materials.slice(0, 5).map((material, index) => (
            <div key={material._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{material.name}</h3>
                  <p className="text-sm text-gray-600">{material.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600">₹{material.pricePerUnit}/{material.unit}</p>
                <p className="text-sm text-gray-600">{material.availableQuantity} {material.unit} available</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierReports;
