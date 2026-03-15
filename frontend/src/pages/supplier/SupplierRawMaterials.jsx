import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import rawMaterialService from '../../services/rawMaterialService';

const RAW_MATERIAL_CATEGORIES = ['Seeds', 'Nuts', 'Fruits', 'Grains', 'Packaging', 'Chemicals', 'Other'];
const RAW_MATERIAL_UNITS = ['kg', 'litre'];

// Predefined material types for standardized inventory grouping
const MATERIAL_TYPES = {
  // Seeds
  GROUNDNUT: 'Groundnut',
  SUNFLOWER_SEEDS: 'Sunflower Seeds',
  SESAME_SEEDS: 'Sesame Seeds',
  FLAX_SEEDS: 'Flax Seeds',
  MUSTARD_SEEDS: 'Mustard Seeds',
  COTTONSEED: 'Cotton Seeds',
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
  PLASTIC_BOTTLE: 'Plastic Bottles',
  GLASS_BOTTLE: 'Glass Bottles',
  LABEL: 'Labels',
  CAP: 'Caps',
  CARTON: 'Cartons',
  // Chemicals
  PRESERVATIVE: 'Preservatives',
  ANTIOXIDANT: 'Antioxidants',
  FLAVORING: 'Flavoring',
  // Other
  OTHER: 'Other'
};

// Convert to array for dropdown
const MATERIAL_TYPE_OPTIONS = Object.values(MATERIAL_TYPES);

const SupplierRawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    materialType: 'Groundnut',
    supplierName: '',
    category: 'Seeds',
    unit: 'kg',
    pricePerUnit: '',
    availableQuantity: '',
    description: '',
    image: '',
    gstRate: 0
  });

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Debounce filter changes to prevent too many requests
    const timeoutId = setTimeout(() => {
      fetchMaterials();
    }, 300);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.status, filters.search]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await rawMaterialService.update(editingMaterial._id, formData);
        toast.success('Raw material updated successfully');
      } else {
        await rawMaterialService.create(formData);
        toast.success('Raw material created successfully');
      }
      setShowModal(false);
      setEditingMaterial(null);
      resetForm();
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      materialType: material.materialType || 'Groundnut',
      supplierName: material.supplierName || '',
      category: material.category,
      unit: material.unit,
      pricePerUnit: material.pricePerUnit,
      availableQuantity: material.availableQuantity,
      description: material.description || '',
      image: material.image || '',
      gstRate: material.gstRate || 0
    });
    setImagePreview(material.image || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      try {
        await rawMaterialService.delete(id);
        toast.success('Raw material deleted successfully');
        fetchMaterials();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      materialType: 'Groundnut',
      supplierName: '',
      category: 'Seeds',
      unit: 'kg',
      pricePerUnit: '',
      availableQuantity: '',
      description: '',
      image: '',
      gstRate: 0
    });
    setImagePreview(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setImagePreview(null);
    resetForm();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-gray-600">Manage your raw material catalog</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Raw Material
        </button>
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

      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : materials.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No raw materials found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {material.image ? (
                      <img
                        src={material.image}
                        alt={material.materialType || material.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        <span className="text-xl">📦</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.materialType || material.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.supplierName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{material.pricePerUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.gstRate || 0}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.availableQuantity} {material.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      material.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {material.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(material)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(material._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingMaterial ? 'Edit Raw Material' : 'Add Raw Material'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Material Type *</label>
                <select
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {MATERIAL_TYPE_OPTIONS.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select the standardized material type for inventory grouping</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Supplier Name *</label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="What you call this material (e.g., Premium Groundnut)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Your specific name for this material</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {RAW_MATERIAL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {RAW_MATERIAL_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Price Per Unit (₹) *</label>
                <input
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">GST Rate (%) *</label>
                <input
                  type="number"
                  name="gstRate"
                  value={formData.gstRate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  min="0"
                  max="28"
                  step="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Available Quantity *</label>
                <input
                  type="number"
                  name="availableQuantity"
                  value={formData.availableQuantity}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  min="0"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
              </div>
              
              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Product Image</label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="mb-3">
                        <span className="text-4xl">📷</span>
                      </div>
                      <label className="cursor-pointer">
                        <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                          Click to upload image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingMaterial ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierRawMaterials;
