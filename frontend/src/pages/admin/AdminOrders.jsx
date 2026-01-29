import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import FormInput from '../../components/FormInput';
import SearchFilters from '../../components/SearchFilters';
import { orderService } from '../../services/orderService';
import { generateInvoice, generatePackingSlip } from '../../utils/invoiceUtils';
import useSocket from '../../hooks/useSocket';

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateRange: { startDate: '', endDate: '' },
    minAmount: '',
    maxAmount: ''
  });
  const [savedFilters, setSavedFilters] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // WebSocket real-time updates
  useSocket((event, data) => {
    if (event === 'new_order') {
      queryClient.invalidateQueries('orders');
    }
  });

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('adminOrderFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  const { data: ordersData, isLoading } = useQuery(
    ['orders', filters],
    () => orderService.getAllOrders({ 
      status: filters.status,
      startDate: filters.dateRange.startDate,
      endDate: filters.dateRange.endDate,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      limit: 100 
    })
  );

  const approveMutation = useMutation(
    (id) => orderService.approveOrder(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        toast.success('Order approved successfully');
        setShowDetailsModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve order');
      }
    }
  );

  const rejectMutation = useMutation(
    ({ id, reason }) => orderService.rejectOrder(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        toast.success('Order rejected');
        setShowRejectModal(false);
        setShowDetailsModal(false);
        setRejectionReason('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject order');
      }
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => orderService.updateOrderStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        toast.success('Order status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    }
  );

  const handleApprove = (order) => {
    if (window.confirm(`Approve order ${order.orderNumber}?`)) {
      approveMutation.mutate(order._id);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    rejectMutation.mutate({ id: selectedOrder._id, reason: rejectionReason });
  };

  const handleStatusChange = (order, newStatus) => {
    updateStatusMutation.mutate({ id: order._id, status: newStatus });
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const columns = [
    {
      header: 'Order Number',
      accessor: 'orderNumber',
      render: (row) => (
        <div>
          <strong style={{ cursor: 'pointer', color: 'var(--primary-color)' }} onClick={() => viewOrderDetails(row)}>
            {row.orderNumber}
          </strong>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {new Date(row.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      header: 'Wholesaler',
      render: (row) => (
        <div>
          <div>{row.wholesaler?.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {row.wholesaler?.businessName}
          </div>
        </div>
      )
    },
    {
      header: 'Items',
      render: (row) => `${row.items?.length || 0} items`
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      render: (row) => <strong>${row.totalAmount?.toFixed(2)}</strong>
    },
    {
      header: 'Status',
      accessor: 'orderStatus',
      render: (row) => {
        const statusColors = {
          pending: 'warning',
          approved: 'success',
          rejected: 'danger',
          processing: 'info',
          shipped: 'info',
          delivered: 'success',
          cancelled: 'danger'
        };
        return <Badge variant={statusColors[row.orderStatus] || 'default'}>{row.orderStatus}</Badge>;
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {row.orderStatus === 'pending' && (
            <>
              <Button variant="secondary" size="small" onClick={() => handleApprove(row)}>
                Approve
              </Button>
              <Button variant="danger" size="small" onClick={() => {
                setSelectedOrder(row);
                setShowRejectModal(true);
              }}>
                Reject
              </Button>
            </>
          )}
          {row.orderStatus === 'approved' && (
            <Button variant="primary" size="small" onClick={() => handleStatusChange(row, 'processing')}>
              Mark Processing
            </Button>
          )}
          {row.orderStatus === 'processing' && (
            <Button variant="primary" size="small" onClick={() => handleStatusChange(row, 'shipped')}>
              Mark Shipped
            </Button>
          )}
          {row.orderStatus === 'shipped' && (
            <Button variant="secondary" size="small" onClick={() => handleStatusChange(row, 'delivered')}>
              Mark Delivered
            </Button>
          )}
          <Button variant="ghost" size="small" onClick={() => viewOrderDetails(row)}>
            View
          </Button>
          <Button 
            variant="success" 
            size="small" 
            onClick={() => {
              generateInvoice(row);
              toast.success('Invoice downloaded');
            }}
          >
            📄 Invoice
          </Button>
          {(row.orderStatus === 'approved' || row.orderStatus === 'processing' || row.orderStatus === 'shipped') && (
            <Button 
              variant="info" 
              size="small" 
              onClick={() => {
                generatePackingSlip(row);
                toast.success('Packing slip downloaded');
              }}
            >
              📦 Packing Slip
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveFilter = (saved) => {
    const updated = [...savedFilters, saved];
    setSavedFilters(updated);
    localStorage.setItem('adminOrderFilters', JSON.stringify(updated));
    toast.success('Filter saved successfully');
  };

  const handleLoadFilter = (saved) => {
    setFilters(saved.filters);
    toast.info(`Loaded filter: ${saved.name}`);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      dateRange: { startDate: '', endDate: '' },
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
  };

  const filterConfig = [
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      value: filters.status,
      placeholder: 'All Statuses',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    {
      key: 'dateRange',
      type: 'daterange',
      label: 'Date Range',
      value: filters.dateRange
    },
    {
      key: 'minAmount',
      type: 'number',
      label: 'Min Amount',
      value: filters.minAmount,
      placeholder: 'Min Amount ($)',
      min: 0
    },
    {
      key: 'maxAmount',
      type: 'number',
      label: 'Max Amount',
      value: filters.maxAmount,
      placeholder: 'Max Amount ($)',
      min: 0
    }
  ];

  // Filter orders by search term
  const orders = ordersData?.data?.data?.orders || [];
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(search) ||
      order.wholesaler?.businessName?.toLowerCase().includes(search) ||
      order.wholesaler?.name?.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Order Management</h1>

      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        savedFilters={savedFilters}
        onSaveFilter={handleSaveFilter}
        onLoadFilter={handleLoadFilter}
        onClearFilters={handleClearFilters}
      />

      <Card>
        {isLoading ? (
          <p>Loading orders...</p>
        ) : (
          <Table
            columns={columns}
            data={filteredOrders}
          />
          />
        )}
      </Card>

      {/* Order Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Order Details - ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Wholesaler:</strong> {selectedOrder.wholesaler?.name}<br />
              <strong>Business:</strong> {selectedOrder.wholesaler?.businessName}<br />
              <strong>Email:</strong> {selectedOrder.wholesaler?.email}<br />
              <strong>Status:</strong> <Badge variant={
                selectedOrder.orderStatus === 'pending' ? 'warning' :
                selectedOrder.orderStatus === 'approved' ? 'success' :
                selectedOrder.orderStatus === 'rejected' ? 'danger' : 'info'
              }>{selectedOrder.orderStatus}</Badge>
            </div>

            <h4 style={{ marginBottom: '12px' }}>Order Items:</h4>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              {selectedOrder.items?.map((item, index) => (
                <div key={index} style={{ 
                  padding: '12px', 
                  borderBottom: index < selectedOrder.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong>{item.product?.name || 'Product'}</strong>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Quantity: {item.quantity} × ${item.unitPrice?.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    ${item.subtotal?.toFixed(2)}
                  </div>
                </div>
              ))}
              <div style={{ 
                padding: '12px', 
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold'
              }}>
                <span>Total Amount:</span>
                <span>${selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder.shippingAddress && (
              <div style={{ marginTop: '16px' }}>
                <strong>Shipping Address:</strong><br />
                {selectedOrder.shippingAddress}
              </div>
            )}

            {selectedOrder.rejectionReason && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
                <strong>Rejection Reason:</strong><br />
                {selectedOrder.rejectionReason}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Order Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Reject Order"
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setShowRejectModal(false);
              setRejectionReason('');
            }}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleReject}
              disabled={rejectMutation.isLoading}
            >
              Reject Order
            </Button>
          </>
        }
      >
        <FormInput
          label="Rejection Reason"
          name="rejectionReason"
          type="textarea"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Please provide a reason for rejecting this order"
          required
        />
      </Modal>
    </div>
  );
};

export default AdminOrders;
