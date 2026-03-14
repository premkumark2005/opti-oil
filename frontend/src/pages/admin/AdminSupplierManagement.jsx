import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminSupplierUserService from '../../services/adminSupplierUserService';

const AdminSupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [stats, setStats] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSupplierId, setRejectingSupplierId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [filters]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await adminSupplierUserService.getAll(filters);
      setSuppliers(response.data?.suppliers || []);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminSupplierUserService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleApprove = async (supplierId) => {
    if (window.confirm('Are you sure you want to approve this supplier?')) {
      try {
        setProcessingId(supplierId);
        await adminSupplierUserService.approve(supplierId);
        toast.success('Supplier approved successfully');
        fetchSuppliers();
        fetchStats();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Approval failed');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      setProcessingId(rejectingSupplierId);
      await adminSupplierUserService.reject(rejectingSupplierId, rejectReason);
      toast.success('Supplier rejected successfully');
      setShowRejectModal(false);
      setRejectingSupplierId(null);
      setRejectReason('');
      fetchSuppliers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (supplierId) => {
    if (window.confirm('Are you sure you want to toggle this supplier\'s status?')) {
      try {
        setProcessingId(supplierId);
        await adminSupplierUserService.toggleStatus(supplierId);
        toast.success('Supplier status updated successfully');
        fetchSuppliers();
        fetchStats();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Status update failed');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      try {
        setProcessingId(supplierId);
        await adminSupplierUserService.delete(supplierId);
        toast.success('Supplier deleted successfully');
        fetchSuppliers();
        fetchStats();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const openRejectModal = (supplierId) => {
    setRejectingSupplierId(supplierId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectingSupplierId(null);
    setRejectReason('');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Supplier Management</h1>
        <p className="text-gray-600 text-lg">Manage supplier accounts and approvals</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-100 text-sm font-medium mb-2">Total Suppliers</h3>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="text-5xl opacity-20">👥</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-yellow-100 text-sm font-medium mb-2">Pending</h3>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="text-5xl opacity-20">⏳</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-100 text-sm font-medium mb-2">Approved</h3>
                <p className="text-3xl font-bold">{stats.approved}</p>
              </div>
              <div className="text-5xl opacity-20">✅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-100 text-sm font-medium mb-2">Rejected</h3>
                <p className="text-3xl font-bold">{stats.rejected}</p>
              </div>
              <div className="text-5xl opacity-20">❌</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              name="search"
              placeholder="Search by name, email, or company..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
            <option value="inactive">⏸️ Inactive</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading suppliers...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl text-gray-500">No suppliers found</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {supplier.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {supplier.businessName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {supplier.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusBadgeClass(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {supplier.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(supplier._id)}
                            disabled={processingId === supplier._id}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === supplier._id ? '⏳' : '✅'} Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(supplier._id)}
                            disabled={processingId === supplier._id}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {supplier.status === 'approved' && (
                        <button
                          onClick={() => handleToggleStatus(supplier._id)}
                          disabled={processingId === supplier._id}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === supplier._id ? '⏳' : '⏸️'} Deactivate
                        </button>
                      )}
                      {supplier.status === 'inactive' && (
                        <button
                          onClick={() => handleToggleStatus(supplier._id)}
                          disabled={processingId === supplier._id}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === supplier._id ? '⏳' : '▶️'} Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(supplier._id)}
                        disabled={processingId === supplier._id}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === supplier._id ? '⏳' : '🗑️'} Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">❌ Reject Supplier</h2>
              <button
                onClick={closeRejectModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Reason for Rejection *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                rows="4"
                placeholder="Please provide a detailed reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRejectModal}
                disabled={processingId !== null}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId !== null}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId ? '⏳ Rejecting...' : 'Reject Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupplierManagement;
