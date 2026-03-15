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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const widgets = [
    {
      title: 'Total Raw Materials',
      value: stats?.total || 0,
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Orders',
      value: orderStats?.total || 0,
      icon: '🛒',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Orders',
      value: orderStats?.pending || 0,
      icon: '⏳',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Completed Orders',
      value: orderStats?.delivered || 0,
      icon: '✅',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Revenue',
      value: `₹${orderStats?.totalRevenue?.toLocaleString() || 0}`,
      icon: '💰',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Supplier Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome back! Here's your business overview</p>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {widgets.map((widget, index) => (
          <div
            key={index}
            className={`${widget.bgColor} rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:scale-105 animate-fadeIn`}
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-br ${widget.color} text-white text-3xl p-4 rounded-xl shadow-md`}>
                {widget.icon}
              </div>
            </div>
            <h3 className="text-gray-700 text-sm font-semibold mb-2">{widget.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{widget.value}</p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      {stats?.byCategory && stats.byCategory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Raw Materials by Category
          </h2>
          <div className="space-y-4">
            {stats.byCategory.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-gray-700">{item._id}</span>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Material Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Materials</span>
              <span className="text-2xl font-bold text-green-600">{stats?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inactive Materials</span>
              <span className="text-2xl font-bold text-red-600">{stats?.inactive || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Order Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Orders</span>
              <span className="text-2xl font-bold text-yellow-600">{orderStats?.pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confirmed Orders</span>
              <span className="text-2xl font-bold text-blue-600">{orderStats?.confirmed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivered Orders</span>
              <span className="text-2xl font-bold text-green-600">{orderStats?.delivered || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
