import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import Badge from '../../components/Badge';
import { supplierService } from '../../services/supplierService';

const AdminSuppliers = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: ''
  });

  const { data: suppliersData, isLoading } = useQuery('suppliers', () =>
    supplierService.getAllSuppliers({ limit: 100 })
  );

  const createMutation = useMutation(
    (data) => supplierService.addSupplier(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
        toast.success('Supplier created successfully');
        setShowModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create supplier');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => supplierService.updateSupplier(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
        toast.success('Supplier updated successfully');
        setShowModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update supplier');
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => supplierService.deleteSupplier(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
        toast.success('Supplier deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete supplier');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      paymentTerms: ''
    });
    setEditingSupplier(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email,
      phone: supplier.phone || '',
      address: supplier.address || '',
      taxId: supplier.taxId || '',
      paymentTerms: supplier.paymentTerms || ''
    });
    setShowModal(true);
  };

  const handleDelete = (supplier) => {
    if (window.confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      deleteMutation.mutate(supplier._id);
    }
  };

  const columns = [
    {
      header: 'Supplier Name',
      accessor: 'name',
      render: (row) => <strong>{row.name}</strong>
    },
    {
      header: 'Contact Person',
      accessor: 'contactPerson'
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Phone',
      accessor: 'phone'
    },
    {
      header: 'Payment Terms',
      accessor: 'paymentTerms',
      render: (row) => row.paymentTerms || 'N/A'
    },
    {
      header: 'Products',
      render: (row) => `${row.suppliedProducts?.length || 0} products`
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Supplier Management</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Add Supplier
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <p>Loading suppliers...</p>
        ) : (
          <Table
            columns={columns}
            data={suppliersData?.data?.data?.suppliers || []}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
              {editingSupplier ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Supplier Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <FormInput
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          />
          
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <FormInput
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          
          <FormInput
            label="Tax ID"
            name="taxId"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          />
          
          <FormInput
            label="Payment Terms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            placeholder="e.g., Net 30, Net 60"
          />
          
          <FormInput
            label="Address"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};

export default AdminSuppliers;
