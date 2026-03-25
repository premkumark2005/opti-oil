import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import Badge from '../../components/Badge';
import { productService } from '../../services/productService';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  .replace(/\/api\/?$/, '')  // strip trailing /api
  .replace(/\/+$/, '');     // strip any remaining trailing slashes

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    basePrice: '',
    unit: 'L',
    brand: '',
    packagingSize: '',
    specifications: '',
    gstRate: 0
  });

  const { data: productsData, isLoading } = useQuery(
    ['products', searchTerm, categoryFilter],
    () => productService.getProducts({ 
      search: searchTerm, 
      category: categoryFilter,
      limit: 100 
    })
  );

  const { data: categoriesData } = useQuery('categories', () => productService.getCategories());

  const createMutation = useMutation(
    (data) => productService.createProduct(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product created successfully');
        setShowModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create product');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => productService.updateProduct(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product updated successfully');
        setShowModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => productService.deleteProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      description: '',
      basePrice: '',
      unit: 'L',
      brand: '',
      packagingSize: '',
      specifications: '',
      gstRate: 0
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData for multipart upload
    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      // Skip specifications field (Map type is complex to handle)
      if (key === 'specifications') {
        return;
      }
      
      // Use null/undefined check instead of falsy check
      // so that numeric 0 values (like gstRate: 0) are still included
      if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });
    
    if (imageFile) {
      submitData.append('image', imageFile);
    }
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,      sku: product.sku,      category: product.category,
      description: product.description || '',
      basePrice: product.basePrice,
      unit: product.unit,
      brand: product.brand || '',
      packagingSize: product.packagingSize || '',
      specifications: product.specifications || '',
      gstRate: product.gstRate || 0
    });
    setImageFile(null);
    setImagePreview(product.image ? `${BACKEND_URL}${product.image}` : null);
    setShowModal(true);
  };

  const handleDelete = (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteMutation.mutate(product._id);
    }
  };

  const columns = [
    {
      header: 'Image',
      width: '80px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.image ? (
            <img 
              src={`${BACKEND_URL}${row.image}`} 
              alt={row.name}
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            style={{ 
              display: row.image ? 'none' : 'flex',
              width: '50px', 
              height: '50px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '4px',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: '#999'
            }}
          >
            📦
          </div>
        </div>
      )
    },
    {
      header: 'Product Name',
      accessor: 'name',
      width: '200px',
      render: (row) => (
        <div>
          <strong>{row.name}</strong>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SKU: {row.sku}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      width: '150px',
      render: (row) => <Badge variant="info">{row.category}</Badge>
    },
    {
      header: 'Brand',
      accessor: 'brand',
      width: '120px'
    },
    {
      header: 'Price (excl. GST)',
      accessor: 'basePrice',
      width: '120px',
      render: (row) => `$${row.basePrice?.toFixed(2)}/${row.unit}`
    },
    {
      header: 'GST',
      accessor: 'gstRate',
      width: '80px',
      render: (row) => `${row.gstRate || 0}%`
    },
    {
      header: 'Stock',
      accessor: 'inventory',
      width: '150px',
      render: (row) => {
        // Check if inventory record exists
        if (!row.inventory) {
          return <Badge variant="secondary">No Inventory</Badge>;
        }
        
        const quantity = row.inventory.availableQuantity || 0;
        const reorderLevel = row.inventory.reorderLevel || 0;
        
        // Strict stock status rules
        if (quantity === 0) {
          // Out of stock
          return <Badge variant="danger">Out of Stock</Badge>;
        } else if (reorderLevel > 0 && quantity > 0 && quantity <= reorderLevel) {
          // Low stock
          return <Badge variant="warning">{quantity} {row.unit}s (Low)</Badge>;
        } else {
          // Normal stock
          return <Badge variant="success">{quantity} {row.unit}s</Badge>;
        }
      }
    },
    {
      header: 'Status',
      accessor: 'isActive',
      width: '100px',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      width: '180px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="primary" size="small" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="small" onClick={() => handleDelete(row)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  const categoryOptions = categoriesData?.data?.data?.categories?.map(cat => ({
    value: cat,
    label: cat
  })) || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Product Management</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Add Product
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p>Loading products...</p>
        ) : (
          <Table
            columns={columns}
            data={productsData?.data?.data?.products || []}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setShowModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <FormInput
            label="Category"
            name="category"
            type="select"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={categoryOptions}
            required
          />
          
          <FormInput
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            placeholder="e.g., SUN-001"
            required
          />
          
          <FormInput
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormInput
              label="Base Price (₹)"
              name="basePrice"
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              required
            />
            
            <FormInput
              label="Unit"
              name="unit"
              type="select"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={[
                { value: 'L', label: 'Liter (L)' },
                { value: 'mL', label: 'Milliliter (mL)' },
                { value: 'kg', label: 'Kilogram (kg)' },
                { value: 'g', label: 'Gram (g)' },
                { value: 'pcs', label: 'Pieces (pcs)' },
                { value: 'bottle', label: 'Bottle' },
                { value: 'carton', label: 'Carton' }
              ]}
              required
            />
          </div>

          {/* GST Rate — separate row for clarity */}
          <div style={{ marginTop: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              GST Rate (%)
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[0, 5, 12, 18, 28].map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setFormData({ ...formData, gstRate: rate })}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: `2px solid ${Number(formData.gstRate) === rate ? '#3498db' : '#e5e7eb'}`,
                    background: Number(formData.gstRate) === rate ? '#eff6ff' : '#f9fafb',
                    color: Number(formData.gstRate) === rate ? '#1d6fa8' : '#374151',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {rate}%
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom"
                min="0"
                max="28"
                value={[0,5,12,18,28].includes(Number(formData.gstRate)) ? '' : formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  width: '90px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              Selected: <strong>{formData.gstRate}%</strong> GST · Price incl. GST: <strong>₹{formData.basePrice ? ((Number(formData.basePrice) * (1 + Number(formData.gstRate) / 100)).toFixed(2)) : '—'}</strong>
            </p>
          </div>
          
          <FormInput
            label="Packaging Size"
            name="packagingSize"
            type="number"
            step="0.01"
            value={formData.packagingSize}
            onChange={(e) => setFormData({ ...formData, packagingSize: e.target.value })}
            placeholder="e.g., 5 (numeric value only)"
            required
          />
          
          <FormInput
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <FormInput
            label="Specifications (Optional)"
            name="specifications"
            type="textarea"
            value={formData.specifications}
            onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
            placeholder="Optional: Additional product specifications"
          />
          
          <div style={{ marginTop: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              fontSize: '14px' 
            }}>
              Product Image
            </label>
            
            {imagePreview && (
              <div style={{ marginBottom: '12px' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }} 
                />
              </div>
            )}
            
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              style={{
                display: 'block',
                padding: '8px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                width: '100%'
              }}
            />
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              marginTop: '4px' 
            }}>
              Max 5MB. Supported: JPEG, PNG, GIF, WebP
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
