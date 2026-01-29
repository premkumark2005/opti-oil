import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { orderService } from '../../services/orderService';
import useSocket from '../../hooks/useSocket';

const WholesalerDashboard = () => {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0
  });

  // WebSocket real-time updates
  useSocket((event, data) => {
    if (event === 'order_approved' || event === 'order_rejected' || event === 'order_status_updated') {
      queryClient.invalidateQueries('myOrders');
    }
  });

  const { data: ordersData } = useQuery('myOrders', () => 
    orderService.getMyOrders({ limit: 100 })
  );

  useEffect(() => {
    if (ordersData?.data?.data?.orders) {
      const orders = ordersData.data.data.orders;
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.orderStatus === 'pending').length,
        deliveredOrders: orders.filter(o => o.orderStatus === 'delivered').length,
        totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      });
    }
  }, [ordersData]);

  const columns = [
    {
      header: 'Order Number',
      accessor: 'orderNumber',
      render: (row) => (
        <div>
          <strong>{row.orderNumber}</strong>
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
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Wholesaler Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Link to="/wholesaler/orders" style={{ textDecoration: 'none' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', color: 'var(--primary-color)' }}>{stats.totalOrders}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Total Orders</p>
            </div>
          </Card>
        </Link>
        
        <Link to="/wholesaler/orders" style={{ textDecoration: 'none' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', color: 'var(--warning-color)' }}>{stats.pendingOrders}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Pending Orders</p>
            </div>
          </Card>
        </Link>
        
        <Link to="/wholesaler/orders" style={{ textDecoration: 'none' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>{stats.deliveredOrders}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Delivered Orders</p>
            </div>
          </Card>
        </Link>
        
        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: 'var(--primary-color)' }}>${stats.totalSpent.toFixed(2)}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Total Spent</p>
          </div>
        </Card>
      </div>

      <Card title="Recent Orders" actions={<Link to="/wholesaler/orders">View All</Link>}>
        {ordersData?.data?.data?.orders?.length > 0 ? (
          <Table
            columns={columns}
            data={ordersData.data.data.orders.slice(0, 5)}
          />
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
            No orders yet. <Link to="/wholesaler/products">Browse products</Link> to place your first order!
          </p>
        )}
      </Card>
    </div>
  );
};

export default WholesalerDashboard;
