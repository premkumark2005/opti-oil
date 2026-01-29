import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import FormInput from '../../components/FormInput';
import { orderService } from '../../services/orderService';
import { generateInvoice } from '../../utils/invoiceUtils';
import useSocket from '../../hooks/useSocket';

const WholesalerOrders = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // WebSocket real-time updates
  useSocket((event, data) => {
    if (event === 'order_approved' || event === 'order_rejected' || event === 'order_status_updated') {
      queryClient.invalidateQueries('myOrders');
    }
  });

  const { data: ordersData, isLoading } = useQuery(
    ['myOrders', statusFilter],
    () => orderService.getMyOrders({ status: statusFilter, limit: 100 })
  );

  const cancelMutation = useMutation(
    ({ id, reason }) => orderService.cancelOrder(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myOrders');
        toast.success('Order cancelled successfully');
        setShowCancelModal(false);
        setShowDetailsModal(false);
        setCancellationReason('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  );

  const handleCancel = () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    cancelMutation.mutate({ id: selectedOrder._id, reason: cancellationReason });
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
      header: 'Payment Status',
      accessor: 'paymentStatus',
      render: (row) => row.paymentStatus || 'N/A'
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="small" onClick={() => viewOrderDetails(row)}>
            View
          </Button>
          {row.orderStatus === 'pending' && (
            <Button variant="danger" size="small" onClick={() => {
              setSelectedOrder(row);
              setShowCancelModal(true);
            }}>
              Cancel
            </Button>
          )}
          {(row.orderStatus !== 'pending' && row.orderStatus !== 'cancelled' && row.orderStatus !== 'rejected') && (
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
          )}
        </div>
      )
    }
  ];

  const getStatusMessage = (order) => {
    switch (order.orderStatus) {
      case 'pending':
        return 'Your order is awaiting admin approval';
      case 'approved':
        return 'Your order has been approved and will be processed soon';
      case 'processing':
        return 'Your order is being prepared';
      case 'shipped':
        return `Your order has been shipped${order.shippedAt ? ` on ${new Date(order.shippedAt).toLocaleDateString()}` : ''}`;
      case 'delivered':
        return `Your order was delivered${order.deliveredAt ? ` on ${new Date(order.deliveredAt).toLocaleDateString()}` : ''}`;
      case 'rejected':
        return 'Your order was rejected';
      case 'cancelled':
        return 'Your order was cancelled';
      default:
        return '';
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>My Orders</h1>

      <Card>
        <div style={{ marginBottom: '20px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <p>Loading orders...</p>
        ) : (
          <Table
            columns={columns}
            data={ordersData?.data?.data?.orders || []}
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
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <Badge variant={
                selectedOrder.orderStatus === 'pending' ? 'warning' :
                selectedOrder.orderStatus === 'approved' ? 'success' :
                selectedOrder.orderStatus === 'rejected' ? 'danger' :
                selectedOrder.orderStatus === 'delivered' ? 'success' : 'info'
              }>
                {selectedOrder.orderStatus}
              </Badge>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                {getStatusMessage(selectedOrder)}
              </p>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '14px' }}>
              <strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}<br />
              {selectedOrder.approvedAt && (
                <>
                  <strong>Approved:</strong> {new Date(selectedOrder.approvedAt).toLocaleDateString()}<br />
                </>
              )}
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

            {selectedOrder.cancellationReason && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
                <strong>Cancellation Reason:</strong><br />
                {selectedOrder.cancellationReason}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancellationReason('');
        }}
        title="Cancel Order"
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setShowCancelModal(false);
              setCancellationReason('');
            }}>
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={cancelMutation.isLoading}
            >
              Cancel Order
            </Button>
          </>
        }
      >
        <FormInput
          label="Cancellation Reason"
          name="cancellationReason"
          type="textarea"
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Please provide a reason for cancelling this order"
          required
        />
      </Modal>
    </div>
  );
};

export default WholesalerOrders;
