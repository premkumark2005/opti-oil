import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import Badge from '../../components/Badge';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';

const AdminInventory = () => {
  const queryClient = useQueryClient();
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [stockInData, setStockInData] = useState({
    product: '',
    quantity: '',
    unitCost: '',
    referenceNumber: ''
  });
  const [stockOutData, setStockOutData] = useState({
    product: '',
    quantity: '',
    referenceNumber: ''
  });
  const [reorderLevel, setReorderLevel] = useState('');

  const { data: inventoryData, isLoading } = useQuery('inventory', () => 
    inventoryService.getAllInventory({ limit: 100 })
  );

  const { data: productsData } = useQuery('products-all', () => 
    productService.getProducts({ limit: 500 })
  );

  const stockInMutation = useMutation(
    (data) => inventoryService.stockIn(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        toast.success('Stock added successfully');
        setShowStockInModal(false);
        setStockInData({ product: '', quantity: '', unitCost: '', referenceNumber: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add stock');
      }
    }
  );

  const stockOutMutation = useMutation(
    (data) => inventoryService.stockOut(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        toast.success('Stock removed successfully');
        setShowStockOutModal(false);
        setStockOutData({ product: '', quantity: '', referenceNumber: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove stock');
      }
    }
  );

  const updateReorderMutation = useMutation(
    ({ id, reorderLevel }) => inventoryService.updateReorderLevel(id, reorderLevel),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        toast.success('Reorder level updated successfully');
        setShowReorderModal(false);
        setSelectedInventory(null);
        setReorderLevel('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update reorder level');
      }
    }
  );

  const handleStockIn = (e) => {
    e.preventDefault();
    stockInMutation.mutate(stockInData);
  };

  const handleStockOut = (e) => {
    e.preventDefault();
    stockOutMutation.mutate(stockOutData);
  };

  const handleUpdateReorder = (e) => {
    e.preventDefault();
    updateReorderMutation.mutate({
      id: selectedInventory._id,
      reorderLevel: parseInt(reorderLevel)
    });
  };

  const openReorderModal = (inventory) => {
    setSelectedInventory(inventory);
    setReorderLevel(inventory.reorderLevel.toString());
    setShowReorderModal(true);
  };

  const columns = [
    {
      header: 'Product',
      render: (row) => (
        <div>
          <strong>{row.product?.name}</strong>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            SKU: {row.product?.sku}
          </div>
        </div>
      )
    },
    {
      header: 'Available',
      accessor: 'availableQuantity',
      render: (row) => (
        <span style={{ fontWeight: 'bold', color: row.availableQuantity <= row.reorderLevel ? 'var(--danger-color)' : 'var(--secondary-color)' }}>
          {row.availableQuantity} {row.product?.unit}s
        </span>
      )
    },
    {
      header: 'Reserved',
      accessor: 'reservedQuantity',
      render: (row) => `${row.reservedQuantity} ${row.product?.unit}s`
    },
    {
      header: 'Total',
      render: (row) => `${row.availableQuantity + row.reservedQuantity} ${row.product?.unit}s`
    },
    {
      header: 'Reorder Level',
      accessor: 'reorderLevel',
      render: (row) => (
        <div>
          {row.reorderLevel} {row.product?.unit}s
          <Button 
            variant="ghost" 
            size="small" 
            onClick={() => openReorderModal(row)}
            style={{ marginLeft: '8px' }}
          >
            Edit
          </Button>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        if (row.availableQuantity === 0) {
          return <Badge variant="danger">Out of Stock</Badge>;
        } else if (row.availableQuantity <= row.reorderLevel) {
          return <Badge variant="warning">Low Stock</Badge>;
        } else {
          return <Badge variant="success">In Stock</Badge>;
        }
      }
    },
    {
      header: 'Last Updated',
      accessor: 'lastUpdated',
      render: (row) => row.lastUpdated ? new Date(row.lastUpdated).toLocaleDateString() : 'N/A'
    }
  ];

  const productOptions = productsData?.data?.data?.products?.map(product => ({
    value: product._id,
    label: `${product.name} (${product.sku})`
  })) || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Inventory Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setShowStockInModal(true)}>
            + Stock In
          </Button>
          <Button variant="danger" onClick={() => setShowStockOutModal(true)}>
            - Stock Out
          </Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <p>Loading inventory...</p>
        ) : (
          <Table
            columns={columns}
            data={inventoryData?.data?.data?.inventory || []}
          />
        )}
      </Card>

      {/* Stock In Modal */}
      <Modal
        isOpen={showStockInModal}
        onClose={() => setShowStockInModal(false)}
        title="Add Stock"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowStockInModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleStockIn}
              disabled={stockInMutation.isLoading}
            >
              Add Stock
            </Button>
          </>
        }
      >
        <form onSubmit={handleStockIn}>
          <FormInput
            label="Product"
            name="product"
            type="select"
            value={stockInData.product}
            onChange={(e) => setStockInData({ ...stockInData, product: e.target.value })}
            options={productOptions}
            required
          />
          
          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            value={stockInData.quantity}
            onChange={(e) => setStockInData({ ...stockInData, quantity: e.target.value })}
            required
          />
          
          <FormInput
            label="Unit Cost"
            name="unitCost"
            type="number"
            step="0.01"
            value={stockInData.unitCost}
            onChange={(e) => setStockInData({ ...stockInData, unitCost: e.target.value })}
            required
          />
          
          <FormInput
            label="Reference Number"
            name="referenceNumber"
            value={stockInData.referenceNumber}
            onChange={(e) => setStockInData({ ...stockInData, referenceNumber: e.target.value })}
            placeholder="Invoice or reference number"
          />
        </form>
      </Modal>

      {/* Stock Out Modal */}
      <Modal
        isOpen={showStockOutModal}
        onClose={() => setShowStockOutModal(false)}
        title="Remove Stock"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowStockOutModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleStockOut}
              disabled={stockOutMutation.isLoading}
            >
              Remove Stock
            </Button>
          </>
        }
      >
        <form onSubmit={handleStockOut}>
          <FormInput
            label="Product"
            name="product"
            type="select"
            value={stockOutData.product}
            onChange={(e) => setStockOutData({ ...stockOutData, product: e.target.value })}
            options={productOptions}
            required
          />
          
          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            value={stockOutData.quantity}
            onChange={(e) => setStockOutData({ ...stockOutData, quantity: e.target.value })}
            required
          />
          
          <FormInput
            label="Reference Number"
            name="referenceNumber"
            value={stockOutData.referenceNumber}
            onChange={(e) => setStockOutData({ ...stockOutData, referenceNumber: e.target.value })}
            placeholder="Reason or reference"
          />
        </form>
      </Modal>

      {/* Reorder Level Modal */}
      <Modal
        isOpen={showReorderModal}
        onClose={() => {
          setShowReorderModal(false);
          setSelectedInventory(null);
          setReorderLevel('');
        }}
        title="Update Reorder Level"
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setShowReorderModal(false);
              setSelectedInventory(null);
              setReorderLevel('');
            }}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateReorder}
              disabled={updateReorderMutation.isLoading}
            >
              Update
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateReorder}>
          <p style={{ marginBottom: '16px' }}>
            <strong>Product:</strong> {selectedInventory?.product?.name}
          </p>
          <FormInput
            label="Reorder Level"
            name="reorderLevel"
            type="number"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default AdminInventory;
