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

  // React Query configuration to prevent too many requests
  const queryConfig = {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 30000, // 30 seconds
    onError: (error) => {
      console.error('Dashboard query error:', error);
    }
  };

  // Fetch product stats
  const { data: productStats, error: productStatsError } = useQuery(
    'productStats', 
    () => productService.getProductStats(), 
    queryConfig
  );

  // Fetch low stock products
  const { data: lowStockData, error: lowStockError } = useQuery(
    'lowStock', 
    () => inventoryService.getLowStockProducts(), 
    queryConfig
  );

  // Fetch top products by stock level for chart
  const { data: topProductsData, error: topProductsError } = useQuery(
    'topProducts', 
    () => inventoryService.getTopProductsByStock(10), 
    queryConfig
  );

  // Fetch pending orders
  const { data: pendingOrdersData, error: pendingOrdersError } = useQuery(
    'pendingOrders', 
    () => orderService.getPendingOrders(), 
    queryConfig
  );

  // Fetch order stats
  const { data: orderStats, error: orderStatsError } = useQuery(
    'orderStats', 
    () => orderService.getOrderStats(), 
    queryConfig
  );

  // Fetch monthly revenue data
  const { data: monthlyRevenueData, error: monthlyRevenueError } = useQuery(
    'monthlyRevenue', 
    () => orderService.getMonthlyRevenue(), 
    queryConfig
  );

  // Log any errors
  useEffect(() => {
    if (productStatsError) console.error('Product stats error:', productStatsError);
    if (lowStockError) console.error('Low stock error:', lowStockError);
    if (topProductsError) console.error('Top products error:', topProductsError);
    if (pendingOrdersError) console.error('Pending orders error:', pendingOrdersError);
    if (orderStatsError) console.error('Order stats error:', orderStatsError);
    if (monthlyRevenueError) console.error('Monthly revenue error:', monthlyRevenueError);
  }, [productStatsError, lowStockError, topProductsError, pendingOrdersError, orderStatsError, monthlyRevenueError]);

  useEffect(() => {
    if (productStats?.data?.data?.stats?.overallStats?.[0]) {
      setStats(prev => ({ ...prev, totalProducts: productStats.data.data.stats.overallStats[0].totalProducts || 0 }));
    }
    if (lowStockData?.data?.data?.items) {
      setStats(prev => ({ ...prev, lowStockItems: lowStockData.data.data.items.length || 0 }));
    }
    if (pendingOrdersData?.data?.data?.orders) {
      setStats(prev => ({ ...prev, pendingOrders: pendingOrdersData.data.data.orders.length || 0 }));
    }
    if (orderStats?.data?.data?.stats?.overallStats?.[0]) {
      setStats(prev => ({ ...prev, totalRevenue: orderStats.data.data.stats.overallStats[0].totalRevenue || 0 }));
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
                labels: orderStats?.data?.data?.stats?.statusDistribution?.map(s => s._id.charAt(0).toUpperCase() + s._id.slice(1)) || [],
                datasets: [
                  {
                    data: orderStats?.data?.data?.stats?.statusDistribution?.map(s => s.count) || [],
                    backgroundColor: [
                      '#F59E0B',  // Warning - Orange
                      '#16A34A',  // Success - Green
                      '#2563EB',  // Accent - Blue
                      '#9333EA',  // Purple
                      '#06B6D4',  // Cyan
                      '#DC2626',  // Danger - Red
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
                    data: monthlyRevenueData?.data?.data?.monthlyRevenue?.map(m => m.revenue) || Array(12).fill(0),
                    borderColor: '#1E3A8A',  // Primary - Deep Blue
                    backgroundColor: 'rgba(30, 58, 138, 0.1)',
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
                labels: topProductsData?.data?.data?.items?.map(item => item.product?.name || 'Unknown') || [],
                datasets: [
                  {
                    label: 'Available Quantity',
                    data: topProductsData?.data?.data?.items?.map(item => item.availableQuantity) || [],
                    backgroundColor: topProductsData?.data?.data?.items?.map(item => 
                      item.availableQuantity < item.reorderLevel ? 'rgba(220, 38, 38, 0.7)' : 'rgba(22, 163, 74, 0.7)'
                    ) || [],
                  },
                  {
                    label: 'Reorder Level',
                    data: topProductsData?.data?.data?.items?.map(item => item.reorderLevel) || [],
                    backgroundColor: 'rgba(245, 158, 11, 0.5)',  // Warning - Orange
                  },
                ],
              }}
            />
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <Card title="Pending Orders" actions={<Link to="/admin/orders">View All</Link>}>
          {pendingOrdersData?.data?.data?.orders?.length > 0 ? (
            <Table
              columns={orderColumns}
              data={pendingOrdersData.data.data.orders.slice(0, 5)}
            />
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
              No pending orders
            </p>
          )}
        </Card>

        <Card title="Low Stock Alert" actions={<Link to="/admin/inventory">View All</Link>}>
          {lowStockData?.data?.data?.items?.length > 0 ? (
            <Table
              columns={lowStockColumns}
              data={lowStockData.data.data.items.slice(0, 5)}
            />
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
              {stats.totalProducts === 0 
                ? 'No products added yet. Add products to monitor stock levels.' 
                : 'All products are well stocked'}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
