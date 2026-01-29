import React, { useState } from 'react';
import { useQuery } from 'react-query';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { reportService } from '../../services/reportService';
import { exportInventoryToPDF, exportOrdersToPDF, exportProductsToExcel, exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { toast } from 'react-toastify';

const AdminReports = () => {
  const [activeReport, setActiveReport] = useState('inventory');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const { data: inventoryReport, isLoading: inventoryLoading, refetch: refetchInventory } = useQuery(
    'inventoryReport',
    () => reportService.getInventoryStatusReport(),
    { enabled: activeReport === 'inventory' }
  );

  const { data: lowStockReport, isLoading: lowStockLoading, refetch: refetchLowStock } = useQuery(
    'lowStockReport',
    () => reportService.getLowStockReport(),
    { enabled: activeReport === 'lowStock' }
  );

  const { data: orderReport, isLoading: orderLoading, refetch: refetchOrders } = useQuery(
    ['orderReport', dateRange],
    () => reportService.getOrderSummaryReport(dateRange),
    { enabled: activeReport === 'orders' }
  );

  const { data: productReport, isLoading: productLoading, refetch: refetchProducts } = useQuery(
    'productReport',
    () => reportService.getProductPerformanceReport(),
    { enabled: activeReport === 'products' }
  );

  const handleExportInventory = () => {
    const report = inventoryReport?.data?.data?.report;
    if (!report || !report.inventory) {
      toast.error('No data to export');
      return;
    }
    exportInventoryToPDF(report.inventory);
    toast.success('Inventory report exported to PDF');
  };

  const handleExportLowStock = () => {
    const report = lowStockReport?.data?.data?.report;
    if (!report || !report.products) {
      toast.error('No data to export');
      return;
    }
    
    const columns = [
      { header: 'Product', dataKey: 'name' },
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Available', dataKey: 'availableQuantity' },
      { header: 'Reorder Level', dataKey: 'reorderLevel' },
      { header: 'Needed', dataKey: 'quantityNeeded' },
      { header: 'Status', dataKey: 'stockStatus' }
    ];
    
    exportToPDF(report.products, columns, `low-stock-${Date.now()}.pdf`, 'Low Stock Alert Report');
    toast.success('Low stock report exported to PDF');
  };

  const handleExportOrders = () => {
    const report = orderReport?.data?.data?.report;
    if (!report || !report.orders) {
      toast.error('No data to export');
      return;
    }
    exportOrdersToPDF(report.orders);
    toast.success('Orders report exported to PDF');
  };

  const handleExportProducts = () => {
    const report = productReport?.data?.data?.report;
    if (!report || !report.products) {
      toast.error('No data to export');
      return;
    }
    exportProductsToExcel(report.products);
    toast.success('Product report exported to Excel');
  };

  const renderInventoryReport = () => {
    const report = inventoryReport?.data?.data?.report;
    if (!report) return null;

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{report.summary?.totalProducts || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Products</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--secondary-color)' }}>{report.summary?.totalAvailableQuantity || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Available Stock</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--warning-color)' }}>{report.summary?.lowStockProducts || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Low Stock</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>${report.summary?.totalInventoryValue?.toFixed(2) || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Inventory Value</p>
            </div>
          </Card>
        </div>

        <Card title="Inventory by Category">
          <Table
            columns={[
              { header: 'Category', accessor: 'category' },
              { header: 'Products', accessor: 'productCount' },
              { header: 'Total Quantity', accessor: 'totalQuantity' },
              { header: 'Reserved', accessor: 'reservedQuantity' },
              { header: 'Value', render: (row) => `$${row.totalValue?.toFixed(2)}` },
              { header: 'Low Stock', accessor: 'lowStockCount' }
            ]}
            data={report.byCategory || []}
          />
        </Card>
      </div>
    );
  };

  const renderLowStockReport = () => {
    const report = lowStockReport?.data?.data?.report;
    if (!report) return null;

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--danger-color)' }}>{report.summary?.outOfStockCount || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Out of Stock</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--warning-color)' }}>{report.summary?.criticalCount || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Critical</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{report.summary?.totalLowStockProducts || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Low Stock</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>${report.summary?.estimatedRestockCost?.toFixed(2) || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Restock Cost</p>
            </div>
          </Card>
        </div>

        <Card title="Low Stock Products">
          <Table
            columns={[
              { header: 'Product', accessor: 'name' },
              { header: 'SKU', accessor: 'sku' },
              { header: 'Category', accessor: 'category' },
              { header: 'Available', accessor: 'availableQuantity' },
              { header: 'Reorder Level', accessor: 'reorderLevel' },
              { header: 'Needed', accessor: 'quantityNeeded' },
              { 
                header: 'Status', 
                render: (row) => (
                  <Badge variant={
                    row.stockStatus === 'OUT_OF_STOCK' ? 'danger' :
                    row.stockStatus === 'CRITICAL' ? 'warning' : 'info'
                  }>
                    {row.stockStatus}
                  </Badge>
                )
              }
            ]}
            data={report.products || []}
          />
        </Card>
      </div>
    );
  };

  const renderOrderReport = () => {
    const report = orderReport?.data?.data?.report;
    if (!report) return null;

    return (
      <div>
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
            />
            <Button onClick={() => refetchOrders()}>Apply Filter</Button>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{report.summary?.totalOrders || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Orders</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--secondary-color)' }}>${report.summary?.totalRevenue?.toFixed(2) || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Revenue</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>${report.summary?.averageOrderValue?.toFixed(2) || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Avg Order Value</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--warning-color)' }}>{report.summary?.pendingOrders || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Pending</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--secondary-color)' }}>{report.summary?.deliveredOrders || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Delivered</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{report.summary?.fulfillmentRate?.toFixed(1) || 0}%</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Fulfillment Rate</p>
            </div>
          </Card>
        </div>

        <Card title="Top Wholesalers" style={{ marginBottom: '24px' }}>
          <Table
            columns={[
              { header: 'Wholesaler', accessor: 'wholesalerName' },
              { header: 'Business', accessor: 'businessName' },
              { header: 'Orders', accessor: 'totalOrders' },
              { header: 'Total Spent', render: (row) => `$${row.totalSpent?.toFixed(2)}` },
              { header: 'Avg Order', render: (row) => `$${row.averageOrderValue?.toFixed(2)}` },
              { header: 'Completed', accessor: 'completedOrders' }
            ]}
            data={report.topWholesalers || []}
          />
        </Card>

        <Card title="Top Products">
          <Table
            columns={[
              { header: 'Product', accessor: 'productName' },
              { header: 'SKU', accessor: 'sku' },
              { header: 'Category', accessor: 'category' },
              { header: 'Quantity Sold', accessor: 'totalQuantityOrdered' },
              { header: 'Revenue', render: (row) => `$${row.totalRevenue?.toFixed(2)}` },
              { header: 'Orders', accessor: 'orderCount' }
            ]}
            data={report.topProducts || []}
          />
        </Card>
      </div>
    );
  };

  const renderProductReport = () => {
    const report = productReport?.data?.data?.report;
    if (!report) return null;

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>{report.summary?.totalProducts || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Products Sold</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--secondary-color)' }}>{report.summary?.totalQuantitySold || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Quantity</p>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>${report.summary?.totalRevenue?.toFixed(2) || 0}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Revenue</p>
            </div>
          </Card>
        </div>

        <Card title="Product Performance">
          <Table
            columns={[
              { header: 'Product', accessor: 'productName' },
              { header: 'Category', accessor: 'category' },
              { header: 'Brand', accessor: 'brand' },
              { header: 'Quantity Sold', accessor: 'totalQuantitySold' },
              { header: 'Revenue', render: (row) => `$${row.totalRevenue?.toFixed(2)}` },
              { header: 'Orders', accessor: 'orderCount' },
              { header: 'Current Stock', accessor: 'currentStock' },
              { header: 'Turnover Ratio', accessor: 'stockTurnoverRatio' }
            ]}
            data={report.products || []}
          />
        </Card>
      </div>
    );
  };

  const isLoading = inventoryLoading || lowStockLoading || orderLoading || productLoading;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Reports & Analytics</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeReport === 'inventory' && (
            <Button variant="success" onClick={handleExportInventory}>
              📄 Export PDF
            </Button>
          )}
          {activeReport === 'lowStock' && (
            <Button variant="success" onClick={handleExportLowStock}>
              📄 Export PDF
            </Button>
          )}
          {activeReport === 'orders' && (
            <Button variant="success" onClick={handleExportOrders}>
              📄 Export PDF
            </Button>
          )}
          {activeReport === 'products' && (
            <Button variant="success" onClick={handleExportProducts}>
              📊 Export Excel
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Button
          variant={activeReport === 'inventory' ? 'primary' : 'outline'}
          onClick={() => setActiveReport('inventory')}
        >
          Inventory Status
        </Button>
        <Button
          variant={activeReport === 'lowStock' ? 'primary' : 'outline'}
          onClick={() => setActiveReport('lowStock')}
        >
          Low Stock
        </Button>
        <Button
          variant={activeReport === 'orders' ? 'primary' : 'outline'}
          onClick={() => setActiveReport('orders')}
        >
          Order Summary
        </Button>
        <Button
          variant={activeReport === 'products' ? 'primary' : 'outline'}
          onClick={() => setActiveReport('products')}
        >
          Product Performance
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading report...</p>
        </Card>
      ) : (
        <>
          {activeReport === 'inventory' && renderInventoryReport()}
          {activeReport === 'lowStock' && renderLowStockReport()}
          {activeReport === 'orders' && renderOrderReport()}
          {activeReport === 'products' && renderProductReport()}
        </>
      )}
    </div>
  );
};

export default AdminReports;
