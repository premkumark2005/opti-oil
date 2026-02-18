import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { userService } from '../../services/userService';

const AdminWholesalers = () => {
  const queryClient = useQueryClient();
  const [selectedWholesaler, setSelectedWholesaler] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch all wholesalers
  const { data: wholesalersData, isLoading } = useQuery(
    'allWholesalers',
    () => userService.getAllWholesalers()
  );

  // Toggle wholesaler active status
  const toggleStatusMutation = useMutation(
    ({ id, isActive }) => userService.updateWholesalerStatus(id, isActive),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allWholesalers');
        toast.success('Wholesaler status updated successfully');
        setShowDetailsModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update wholesaler status');
      }
    }
  );

  const handleViewDetails = (wholesaler) => {
    setSelectedWholesaler(wholesaler);
    setShowDetailsModal(true);
  };

  const handleToggleStatus = (wholesaler) => {
    const isCurrentlyActive = wholesaler.status === 'active';
    if (window.confirm(`Are you sure you want to ${isCurrentlyActive ? 'deactivate' : 'activate'} ${wholesaler.name}?`)) {
      toggleStatusMutation.mutate({ 
        id: wholesaler._id, 
        isActive: !isCurrentlyActive
      });
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => <strong>{row.name}</strong>
    },
    {
      header: 'Business Name',
      accessor: 'businessName',
      render: (row) => row.businessName || 'N/A'
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => row.phone || 'N/A'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'}>
          {row.status?.toUpperCase()}
        </Badge>
      )
    },
    {
      header: 'Registered',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleViewDetails(row)}
          >
            View Details
          </Button>
          <Button
            variant={row.status === 'active' ? 'danger' : 'success'}
            size="small"
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  const wholesalers = wholesalersData?.data?.data?.users || [];
  const stats = {
    total: wholesalers.length,
    active: wholesalers.filter(w => w.status === 'active').length,
    inactive: wholesalers.filter(w => w.status === 'inactive').length,
    pending: wholesalers.filter(w => w.status === 'pending').length
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Wholesaler Management</h1>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: 'var(--primary-color)' }}>{stats.total}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Total Wholesalers</p>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: 'var(--success-color)' }}>{stats.active}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Active</p>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: 'var(--warning-color)' }}>{stats.pending}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Pending</p>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: 'var(--danger-color)' }}>{stats.inactive}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Inactive</p>
          </div>
        </Card>
      </div>

      {/* Wholesalers Table */}
      <Card title="All Wholesalers">
        {isLoading ? (
          <p>Loading wholesalers...</p>
        ) : wholesalers.length > 0 ? (
          <Table columns={columns} data={wholesalers} />
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
            No wholesalers registered yet
          </p>
        )}
      </Card>

      {/* Wholesaler Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Wholesaler Details"
      >
        {selectedWholesaler && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Name</label>
              <p>{selectedWholesaler.name}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Business Name</label>
              <p>{selectedWholesaler.businessName || 'N/A'}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Email</label>
              <p>{selectedWholesaler.email}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Phone</label>
              <p>{selectedWholesaler.phone || 'N/A'}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Address</label>
              <p>{selectedWholesaler.address || 'N/A'}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Status</label>
              <Badge variant={selectedWholesaler.status === 'active' ? 'success' : selectedWholesaler.status === 'pending' ? 'warning' : 'danger'}>
                {selectedWholesaler.status?.toUpperCase()}
              </Badge>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Registered On</label>
              <p>{new Date(selectedWholesaler.createdAt).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button
                variant={selectedWholesaler.status === 'active' ? 'danger' : 'success'}
                onClick={() => handleToggleStatus(selectedWholesaler)}
                style={{ flex: 1 }}
              >
                {selectedWholesaler.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
                style={{ flex: 1 }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminWholesalers;

