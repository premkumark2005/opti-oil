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
    category: '',
    description: '',
    basePrice: '',
    unit: 'Liter',
    brand: '',
    packagingSize: '',
    specifications: ''
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
      category: '',
      description: '',
      basePrice: '',
      unit: 'Liter',
      brand: '',
      packagingSize: '',
      specifications: ''
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
      if (formData[key]) {
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
      name: product.name,
      category: product.category,
      description: product.description || '',
      basePrice: product.basePrice,
      unit: product.unit,
      brand: product.brand || '',
      packagingSize: product.packagingSize || '',
      specifications: product.specifications || ''
    });
    setImageFile(null);
    setImagePreview(product.image ? `http://localhost:5000${product.image}` : null);
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
      render: (row) => (
        <img 
          src={row.image ? `http://localhost:5000${row.image}` : '/placeholder-product.png'} 
          alt={row.name}
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
          onError={(e) => { e.target.src = '/placeholder-product.png'; }}
        />
      )
    },
    {
      header: 'Product Name',
      accessor: 'name',
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
      render: (row) => <Badge variant="info">{row.category}</Badge>
    },
    {
      header: 'Brand',
      accessor: 'brand'
    },
    {
      header: 'Price',
      accessor: 'basePrice',
      render: (row) => `$${row.basePrice?.toFixed(2)}/${row.unit}`
    },
    {
      header: 'Stock',
      accessor: 'inventory',
      render: (row) => row.inStock ? (
        <Badge variant="success">{row.inventory?.availableQuantity || 0} {row.unit}s</Badge>
      ) : (
        <Badge variant="danger">Out of Stock</Badge>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
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
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormInput
              label="Base Price"
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
                { value: 'Liter', label: 'Liter' },
                { value: 'Kilogram', label: 'Kilogram' },
                { value: 'Gallon', label: 'Gallon' },
                { value: 'Bottle', label: 'Bottle' },
                { value: 'Can', label: 'Can' }
              ]}
              required
            />
          </div>
          
          <FormInput
            label="Packaging Size"
            name="packagingSize"
            value={formData.packagingSize}
            onChange={(e) => setFormData({ ...formData, packagingSize: e.target.value })}
            placeholder="e.g., 5L, 20L"
          />
          
          <FormInput
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <FormInput
            label="Specifications"
            name="specifications"
            type="textarea"
            value={formData.specifications}
            onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
            placeholder="Additional product specifications"
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
