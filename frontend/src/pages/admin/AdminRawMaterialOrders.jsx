import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import rawMaterialOrderService from '../../services/rawMaterialOrderService';
import { paymentService } from '../../services/paymentService';

const ORDER_STATUS = ['pending', 'confirmed', 'delivered', 'cancelled'];

const AdminRawMaterialOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    supplier: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0,
    totalAmount: 0
  });
  const [processingPayout, setProcessingPayout] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await rawMaterialOrderService.getAll(filters);
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalAmount: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    };
    setStats(stats);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleExportToCSV = () => {
    if (orders.length === 0) {
      toast.warning('No orders to export');
      return;
    }

    const headers = ['Order Number', 'Date', 'Supplier', 'Material', 'Quantity', 'Unit Price', 'Total Price', 'Status'];
    const csvData = orders.map(order => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString(),
      order.supplier?.businessName || 'N/A',
      order.rawMaterial?.name || 'N/A',
      order.quantity,
      `₹${order.unitPrice?.toFixed(2) || 0}`,
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
    a.download = `raw-material-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Orders exported to CSV');
  };

  const handlePayout = async (orderId) => {
    try {
      setProcessingPayout(true);
      await paymentService.createSupplierPayout(orderId);
      toast.success('Payout to supplier successful!');
      fetchOrders();
      setShowPayoutModal(false);
      setShowDetailsModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payout failed');
    } finally {
      setProcessingPayout(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      search: '',
      startDate: '',
      endDate: '',
      supplier: ''
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = 
      !filters.search ||
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.rawMaterial?.name?.toLowerCase().includes(searchLower) ||
      order.supplier?.businessName?.toLowerCase().includes(searchLower);

    const matchesStatus = !filters.status || order.status === filters.status;
    
    const matchesSupplier = 
      !filters.supplier ||
      order.supplier?.businessName?.toLowerCase().includes(filters.supplier.toLowerCase());

    const orderDate = new Date(order.createdAt);
    const matchesStartDate = !filters.startDate || orderDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || orderDate <= new Date(filters.endDate);

    return matchesSearch && matchesStatus && matchesSupplier && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Raw Material Orders</h1>
        <p className="text-gray-600">Track and manage all raw material orders placed with suppliers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Delivered</div>
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-500 text-sm mb-1">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search orders, materials, suppliers..."
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            {ORDER_STATUS.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="supplier"
            value={filters.supplier}
            onChange={handleFilterChange}
            placeholder="Filter by supplier..."
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset Filters
          </button>
          <button
            onClick={handleExportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📥 Export to CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">
              {filters.search || filters.status || filters.supplier || filters.startDate || filters.endDate
                ? 'Try adjusting your filters'
                : 'Start by placing orders from the Raw Material Ordering page'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
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
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.supplier?.businessName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.supplier?.contactPerson || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.rawMaterial?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.rawMaterial?.category || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.quantity} {order.rawMaterial?.unit || 'units'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{order.totalPrice?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-gray-400">
                        @ ₹{order.unitPrice?.toFixed(2) || '0.00'}/{order.rawMaterial?.unit || 'unit'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.supplierPaymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : order.supplierPaymentStatus === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.supplierPaymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Order Header */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Order Number</div>
                    <div className="text-lg font-bold text-gray-900">{selectedOrder.orderNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Order Date</div>
                    <div className="text-base font-medium text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Placed By</div>
                    <div className="text-base font-medium text-gray-900">
                      {selectedOrder.placedBy?.username || 'Admin'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Supplier Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Business Name</div>
                      <div className="font-medium text-gray-900">{selectedOrder.supplier?.businessName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Contact Person</div>
                      <div className="font-medium text-gray-900">{selectedOrder.supplier?.contactPerson || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{selectedOrder.supplier?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900">{selectedOrder.supplier?.phone || 'N/A'}</div>
                    </div>
                    {selectedOrder.supplier?.address && (
                      <div className="col-span-2">
                        <div className="text-sm text-gray-500">Address</div>
                        <div className="font-medium text-gray-900">{selectedOrder.supplier.address}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Material Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Material Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex gap-4">
                    {selectedOrder.rawMaterial?.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={selectedOrder.rawMaterial.image}
                          alt={selectedOrder.rawMaterial.materialType || selectedOrder.rawMaterial.name}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    <div className="flex-grow grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Material Type</div>
                        <div className="font-medium text-gray-900">{selectedOrder.rawMaterial?.materialType || selectedOrder.rawMaterial?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Supplier Name</div>
                        <div className="font-medium text-gray-900">{selectedOrder.rawMaterial?.supplierName || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Category</div>
                        <div className="font-medium text-gray-900">{selectedOrder.rawMaterial?.category || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Quantity Ordered</div>
                        <div className="font-medium text-gray-900">
                          {selectedOrder.quantity} {selectedOrder.rawMaterial?.unit || 'units'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Unit Price</div>
                        <div className="font-medium text-gray-900">
                          ₹{selectedOrder.unitPrice?.toFixed(2) || '0.00'}/{selectedOrder.rawMaterial?.unit || 'unit'}
                        </div>
                      </div>
                      {selectedOrder.rawMaterial?.description && (
                        <div className="col-span-2">
                          <div className="text-sm text-gray-500">Description</div>
                          <div className="text-gray-900">{selectedOrder.rawMaterial.description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal (Excl. GST):</span>
                      <span>₹{selectedOrder.baseTotalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Total GST:</span>
                      <span>₹{selectedOrder.gstAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                      <span>Total Amount:</span>
                      <span>₹{selectedOrder.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Order Placed</div>
                      <div className="text-sm text-gray-500">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">↻</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Last Updated</div>
                        <div className="text-sm text-gray-500">
                          {new Date(selectedOrder.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedOrder.status === 'delivered' && selectedOrder.deliveredAt && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">📦</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Delivered</div>
                        <div className="text-sm text-gray-500">
                          {new Date(selectedOrder.deliveredAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
              {(selectedOrder.supplierPaymentStatus !== 'Paid' && selectedOrder.status !== 'cancelled') ? (
                <button
                  onClick={() => setShowPayoutModal(true)}
                  disabled={processingPayout}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {processingPayout ? 'Processing...' : 'Pay Supplier'}
                </button>
              ) : <div></div>}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Payout Confirmation Modal */}
      {showPayoutModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-50 rounded-t-lg">
              <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span className="text-2xl">🏦</span> Confirm Bank Transfer
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4 text-center">
                You are about to initiate an IMPS bank transfer from your RazorpayX ledger directly to the supplier's registered bank account.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Supplier:</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.supplier?.businessName || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Order Ref:</span>
                  <span className="font-medium text-gray-900">{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-700 font-medium">Transfer Amount:</span>
                  <span className="font-bold text-blue-700 text-lg">₹{(selectedOrder.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  disabled={processingPayout}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePayout(selectedOrder._id)}
                  disabled={processingPayout}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 relative overflow-hidden disabled:bg-blue-400"
                >
                  {processingPayout ? (
                    <>
                      <span className="animate-spin text-xl leading-none">↻</span> Processing...
                    </>
                  ) : (
                    'Confirm Payment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRawMaterialOrders;
