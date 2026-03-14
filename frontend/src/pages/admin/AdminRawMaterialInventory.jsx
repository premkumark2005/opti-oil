import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import rawMaterialInventoryService from '../../services/rawMaterialInventoryService';

const AdminRawMaterialInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'stockIn', 'stockOut', 'adjust', 'reorderLevel'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    quantity: '',
    reason: ''
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await rawMaterialInventoryService.getAll();
      setInventory(response.data.inventories || []);
    } catch (error) {
      toast.error('Failed to fetch inventory');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (inventoryId) => {
    try {
      const response = await rawMaterialInventoryService.getTransactions(inventoryId);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      toast.error('Failed to fetch transactions');
      setTransactions([]);
    }
  };

  const openModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    setFormData({ quantity: '', reason: '' });
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
    setFormData({ quantity: '', reason: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      switch (modalType) {
        case 'stockIn':
          await rawMaterialInventoryService.stockIn(selectedItem._id, {
            quantity: parseFloat(formData.quantity),
            reason: formData.reason
          });
          toast.success('Stock added successfully');
          break;
        case 'stockOut':
          await rawMaterialInventoryService.stockOut(selectedItem._id, {
            quantity: parseFloat(formData.quantity),
            reason: formData.reason
          });
          toast.success('Stock removed successfully');
          break;
        case 'adjust':
          await rawMaterialInventoryService.adjust(selectedItem._id, {
            newQuantity: parseFloat(formData.quantity),
            reason: formData.reason
          });
          toast.success('Inventory adjusted successfully');
          break;
        case 'reorderLevel':
          await rawMaterialInventoryService.updateReorderLevel(selectedItem._id, {
            reorderLevel: parseFloat(formData.quantity)
          });
          toast.success('Reorder level updated successfully');
          break;
      }
      closeModal();
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const toggleRowExpansion = async (inventoryId) => {
    if (expandedRow === inventoryId) {
      setExpandedRow(null);
      setTransactions([]);
    } else {
      setExpandedRow(inventoryId);
      await fetchTransactions(inventoryId);
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'stockIn': return 'Stock In';
      case 'stockOut': return 'Stock Out';
      case 'adjust': return 'Adjust Inventory';
      case 'reorderLevel': return 'Update Reorder Level';
      default: return '';
    }
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter(item => {
    // Filter out N/A or invalid entries
    if (!item.materialType || item.materialType === 'N/A') return false;
    
    // Search filter
    if (searchTerm && !item.materialType.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (categoryFilter && item.category !== categoryFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter === 'low' && !item.isLowStock) {
      return false;
    }
    if (statusFilter === 'good' && item.isLowStock) {
      return false;
    }
    
    return true;
  });

  // Calculate stats
  const stats = {
    totalItems: filteredInventory.length,
    lowStock: filteredInventory.filter(item => item.isLowStock).length,
    goodStock: filteredInventory.filter(item => !item.isLowStock).length,
    totalValue: filteredInventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
  };

  // Get unique categories
  const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Raw Material Inventory</h1>
        <p className="text-gray-600">Manage raw material stock levels</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock Alert</p>
              <p className="text-3xl font-bold text-red-600">{stats.lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Good Stock</p>
              <p className="text-3xl font-bold text-green-600">{stats.goodStock}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalValue.toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Material</label>
            <input
              type="text"
              placeholder="Search by material type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="low">Low Stock</option>
              <option value="good">Good Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg font-medium">No inventory items found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <>
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.materialType || item.rawMaterial?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Consolidated from all suppliers
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.category || item.rawMaterial?.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {item.quantity} {item.unit || item.rawMaterial?.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.reorderLevel} {item.unit || item.rawMaterial?.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.isLowStock ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('stockIn', item)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Stock In
                          </button>
                          <button
                            onClick={() => openModal('stockOut', item)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Stock Out
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('adjust', item)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => openModal('reorderLevel', item)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Reorder
                          </button>
                        </div>
                        <button
                          onClick={() => toggleRowExpansion(item._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedRow === item._id ? 'Hide' : 'Show'} History
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === item._id && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="text-sm">
                          <h4 className="font-bold mb-2">Transaction History</h4>
                          {transactions.length === 0 ? (
                            <p className="text-gray-500">No transactions found</p>
                          ) : (
                            <table className="min-w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Previous</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">New</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reason</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">By</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transactions.map((txn) => (
                                  <tr key={txn._id} className="border-t border-gray-200">
                                    <td className="px-4 py-2">{new Date(txn.transactionDate).toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        txn.transactionType === 'stock-in' ? 'bg-green-100 text-green-800' :
                                        txn.transactionType === 'stock-out' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {txn.transactionType}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">{txn.quantity}</td>
                                    <td className="px-4 py-2">{txn.previousQuantity}</td>
                                    <td className="px-4 py-2">{txn.newQuantity}</td>
                                    <td className="px-4 py-2">{txn.reason || 'N/A'}</td>
                                    <td className="px-4 py-2">{txn.performedBy?.name || 'System'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">{getModalTitle()}</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Material</p>
              <p className="text-lg font-bold">{selectedItem.rawMaterial?.name}</p>
              <p className="text-sm text-gray-600 mt-2">
                Current Quantity: <span className="font-semibold">{selectedItem.quantity} {selectedItem.rawMaterial?.unit}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  {modalType === 'reorderLevel' ? 'Reorder Level' : 
                   modalType === 'adjust' ? 'New Quantity' : 'Quantity'} *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              {modalType !== 'reorderLevel' && (
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Reason *</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRawMaterialInventory;
