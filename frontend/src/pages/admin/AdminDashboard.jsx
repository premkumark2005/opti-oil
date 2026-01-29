import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { LineChart, BarChart, DoughnutChart } from '../../components/Charts';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import { orderService } from '../../services/orderService';
import useSocket from '../../hooks/useSocket';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  // WebSocket real-time updates
  useSocket((event, data) => {
    if (event === 'new_order') {
      queryClient.invalidateQueries('pendingOrders');
      queryClient.invalidateQueries('orderStats');
    } else if (event === 'low_stock_alert') {
      queryClient.invalidateQueries('lowStock');
    } else if (event === 'inventory_updated') {
      queryClient.invalidateQueries('lowStock');
      queryClient.invalidateQueries('productStats');
    }
  });

  // Fetch product stats
  const { data: productStats } = useQuery('productStats', () => productService.getProductStats());

  // Fetch low stock products
  const { data: lowStockData } = useQuery('lowStock', () => inventoryService.getLowStockProducts());

  // Fetch pending orders
  const { data: pendingOrdersData } = useQuery('pendingOrders', () => orderService.getPendingOrders());

  // Fetch order stats
  const { data: orderStats } = useQuery('orderStats', () => orderService.getOrderStats());

  useEffect(() => {
    if (productStats?.data?.data) {
      setStats(prev => ({ ...prev, totalProducts: productStats.data.data.totalProducts || 0 }));
    }
    if (lowStockData?.data?.data) {
      setStats(prev => ({ ...prev, lowStockItems: lowStockData.data.data.length || 0 }));
    }
    if (pendingOrdersData?.data?.data) {
      setStats(prev => ({ ...prev, pendingOrders: pendingOrdersData.data.data.length || 0 }));
    }
    if (orderStats?.data?.data) {
      setStats(prev => ({ ...prev, totalRevenue: orderStats.data.data.totalRevenue || 0 }));
    }
  }, [productStats, lowStockData, pendingOrdersData, orderStats]);

  const orderColumns = [
    {
      header: 'Order Number',
      accessor: 'orderNumber',
      render: (row) => <strong>{row.orderNumber}</strong>
    },
    {
      header: 'Wholesaler',
      accessor: 'wholesaler',
      render: (row) => row.wholesaler?.name || 'N/A'
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      render: (row) => `$${row.totalAmount?.toFixed(2)}`
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

  const lowStockColumns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (row) => row.product?.name || 'N/A'
    },
    {
      header: 'SKU',
      accessor: 'sku',
      render: (row) => row.product?.sku || 'N/A'
    },
    {
      header: 'Available',
      accessor: 'availableQuantity',
      render: (row) => <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>{row.availableQuantity}</span>
    },
    {
      header: 'Reorder Level',
      accessor: 'reorderLevel'
    }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Link to="/admin/products" style={{ textDecoration: 'none' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', color: 'var(--primary-color)' }}>{stats.totalProducts}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Total Products</p>
            </div>
          </Card>
        </Link>
        
        <Link to="/admin/inventory" style={{ textDecoration: 'none' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', color: 'var(--warning-color)' }}>{stats.lowStockItems}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Low Stock Items</p>
            </div>
          </Card>
        </Link>
        
        <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>{stats.pendingOrders}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Pending Orders</p>
            </div>
          </Card>
        </Link>
        
        <Link to="/admin/reports" style={{ textDecoration: 'none' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '32px', color: 'var(--primary-color)' }}>${stats.totalRevenue.toFixed(2)}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Total Revenue</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Order Status Chart */}
        <Card title="Order Status Distribution">
          <div style={{ height: '300px' }}>
            <DoughnutChart
              data={{
                labels: ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
                datasets: [
                  {
                    data: [
                      pendingOrdersData?.data?.data?.filter(o => o.orderStatus === 'pending').length || 0,
                      pendingOrdersData?.data?.data?.filter(o => o.orderStatus === 'approved').length || 0,
                      pendingOrdersData?.data?.data?.filter(o => o.orderStatus === 'processing').length || 0,
                      pendingOrdersData?.data?.data?.filter(o => o.orderStatus === 'shipped').length || 0,
                      pendingOrdersData?.data?.data?.filter(o => o.orderStatus === 'delivered').length || 0,
                      pendingOrdersData?.data?.data?.filter(o => o.orderStatus === 'cancelled').length || 0,
                    ],
                    backgroundColor: [
                      '#f39c12',
                      '#2ecc71',
                      '#3498db',
                      '#9b59b6',
                      '#1abc9c',
                      '#e74c3c',
                    ],
                  },
                ],
              }}
            />
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card title="Monthly Revenue Trend">
          <div style={{ height: '300px' }}>
            <LineChart
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: 'Revenue ($)',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 40000, 38000, 45000],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
            />
          </div>
        </Card>
      </div>

      {/* Inventory Status Chart */}
      <div style={{ marginBottom: '24px' }}>
        <Card title="Top 10 Products by Stock Level">
          <div style={{ height: '300px' }}>
            <BarChart
              data={{
                labels: lowStockData?.data?.data?.slice(0, 10).map(item => item.product?.name || 'Unknown') || [],
                datasets: [
                  {
                    label: 'Available Quantity',
                    data: lowStockData?.data?.data?.slice(0, 10).map(item => item.availableQuantity) || [],
                    backgroundColor: lowStockData?.data?.data?.slice(0, 10).map(item => 
                      item.availableQuantity < item.reorderLevel ? 'rgba(231, 76, 60, 0.7)' : 'rgba(46, 204, 113, 0.7)'
                    ) || [],
                  },
                  {
                    label: 'Reorder Level',
                    data: lowStockData?.data?.data?.slice(0, 10).map(item => item.reorderLevel) || [],
                    backgroundColor: 'rgba(241, 196, 15, 0.5)',
                  },
                ],
              }}
            />
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <Card title="Pending Orders" actions={<Link to="/admin/orders">View All</Link>}>
          {pendingOrdersData?.data?.data?.length > 0 ? (
            <Table
              columns={orderColumns}
              data={pendingOrdersData.data.data.slice(0, 5)}
            />
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
              No pending orders
            </p>
          )}
        </Card>

        <Card title="Low Stock Alert" actions={<Link to="/admin/inventory">View All</Link>}>
          {lowStockData?.data?.data?.length > 0 ? (
            <Table
              columns={lowStockColumns}
              data={lowStockData.data.data.slice(0, 5)}
            />
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
              All products are well stocked
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
