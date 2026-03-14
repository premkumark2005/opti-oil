import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import rawMaterialService from '../../services/rawMaterialService';
import rawMaterialOrderService from '../../services/rawMaterialOrderService';

const RAW_MATERIAL_CATEGORIES = ['Seeds', 'Nuts', 'Fruits', 'Grains', 'Packaging', 'Chemicals', 'Other'];

const AdminRawMaterialOrdering = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '', status: 'active' });
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await rawMaterialService.getAll(filters);
      setMaterials(response.data.rawMaterials || []);
    } catch (error) {
      toast.error('Failed to fetch raw materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openOrderModal = (material) => {
    setSelectedMaterial(material);
    setShowOrderModal(true);
    setOrderQuantity('');
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedMaterial(null);
    setOrderQuantity('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!orderQuantity || parseFloat(orderQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (parseFloat(orderQuantity) > selectedMaterial.availableQuantity) {
      toast.error('Order quantity exceeds available quantity');
      return;
    }

    try {
      await rawMaterialOrderService.create({
        rawMaterialId: selectedMaterial._id,
        quantityOrdered: parseFloat(orderQuantity)
      });
      toast.success('Order placed successfully');
      closeOrderModal();
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order placement failed');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Raw Material Ordering</h1>
        <p className="text-gray-600">Browse and order raw materials from suppliers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by name..."
            value={filters.search}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {RAW_MATERIAL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : materials.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-md">
          No raw materials available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div key={material._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              {material.image ? (
                <div className="w-full h-48 overflow-hidden">
                  <img 
                    src={material.image} 
                    alt={material.materialType || material.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-6xl">📦</span>
                </div>
              )}

              <div className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{material.materialType || material.name}</h3>
                      {material.supplierName && (
                        <p className="text-sm text-gray-500 italic">Supplier calls it: {material.supplierName}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      material.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {material.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{material.category}</p>
                </div>

                {material.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{material.description}</p>
                )}

                <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price per {material.unit}</p>
                    <p className="text-lg font-bold text-indigo-600">₹{material.pricePerUnit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Available</p>
                    <p className="text-lg font-bold text-gray-900">
                      {material.availableQuantity} {material.unit}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Supplier</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {material.supplier?.businessName || material.supplier?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {material.supplier?.email}
                  </p>
                </div>

                <button
                  onClick={() => openOrderModal(material)}
                  disabled={material.status !== 'active' || material.availableQuantity === 0}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    material.status === 'active' && material.availableQuantity > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {material.availableQuantity === 0 ? 'Out of Stock' : 'Place Order'}
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Place Order</h2>
            
            <div className="mb-6">
              {/* Product Image Preview */}
              {selectedMaterial.image ? (
                <div className="w-full h-40 overflow-hidden rounded-lg mb-4">
                  <img 
                    src={selectedMaterial.image} 
                    alt={selectedMaterial.materialType || selectedMaterial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-5xl">📦</span>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedMaterial.materialType || selectedMaterial.name}</h3>
                {selectedMaterial.supplierName && (
                  <p className="text-sm text-gray-500 italic mb-2">Supplier calls it: {selectedMaterial.supplierName}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold">{selectedMaterial.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per {selectedMaterial.unit}:</span>
                    <span className="font-semibold">₹{selectedMaterial.pricePerUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Quantity:</span>
                    <span className="font-semibold">{selectedMaterial.availableQuantity} {selectedMaterial.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supplier:</span>
                    <span className="font-semibold">{selectedMaterial.supplier?.businessName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Order Quantity ({selectedMaterial.unit}) *</label>
                  <input
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    min="1"
                    max={selectedMaterial.availableQuantity}
                    step="0.01"
                  />
                </div>

                {orderQuantity && (
                  <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total Price:</span>
                      <span className="text-xl font-bold text-indigo-600">
                        ₹{(parseFloat(orderQuantity) * selectedMaterial.pricePerUnit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeOrderModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRawMaterialOrdering;
