import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data to PDF
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions [{header: '', dataKey: ''}]
 * @param {String} fileName - Output file name
 * @param {String} title - Document title
 */
export const exportToPDF = (data, columns, fileName = 'report.pdf', title = 'Report') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Add table
  doc.autoTable({
    startY: 35,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey] || '-')),
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219] },
    styles: { fontSize: 9 },
    margin: { top: 35 }
  });
  
  // Save PDF
  doc.save(fileName);
};

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Output file name
 * @param {String} sheetName - Sheet name
 */
export const exportToExcel = (data, fileName = 'report.xlsx', sheetName = 'Sheet1') => {
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Save file
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'  
  });
  saveAs(blob, fileName);
};

/**
 * Export inventory report to PDF
 */
export const exportInventoryToPDF = (inventoryData) => {
  const columns = [
    { header: 'Product Name', dataKey: 'productName' },
    { header: 'SKU', dataKey: 'sku' },
    { header: 'Available', dataKey: 'availableQuantity' },
    { header: 'Reserved', dataKey: 'reservedQuantity' },
    { header: 'Reorder Level', dataKey: 'reorderLevel' },
    { header: 'Status', dataKey: 'status' }
  ];
  
  const data = inventoryData.map(item => ({
    productName: item.product?.name || 'Unknown',
    sku: item.product?.sku || 'N/A',
    availableQuantity: item.availableQuantity,
    reservedQuantity: item.reservedQuantity,
    reorderLevel: item.reorderLevel,
    status: item.availableQuantity < item.reorderLevel ? 'Low Stock' : 'OK'
  }));
  
  exportToPDF(data, columns, `inventory-report-${Date.now()}.pdf`, 'Inventory Status Report');
};

/**
 * Export orders report to PDF
 */
export const exportOrdersToPDF = (ordersData) => {
  const columns = [
    { header: 'Order Number', dataKey: 'orderNumber' },
    { header: 'Wholesaler', dataKey: 'wholesaler' },
    { header: 'Total Amount', dataKey: 'totalAmount' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Date', dataKey: 'date' }
  ];
  
  const data = ordersData.map(order => ({
    orderNumber: order.orderNumber,
    wholesaler: order.wholesaler?.name || order.wholesaler?.businessName || 'N/A',
    totalAmount: `$${order.totalAmount?.toFixed(2)}`,
    status: order.orderStatus,
    date: new Date(order.createdAt).toLocaleDateString()
  }));
  
  exportToPDF(data, columns, `orders-report-${Date.now()}.pdf`, 'Orders Report');
};

/**
 * Export products to Excel
 */
export const exportProductsToExcel = (productsData) => {
  const data = productsData.map(product => ({
    'Product Name': product.name,
    'SKU': product.sku,
    'Category': product.category,
    'Brand': product.brand || 'N/A',
    'Base Price': product.basePrice,
    'Unit': product.unit,
    'Packaging Size': product.packagingSize,
    'Active': product.isActive ? 'Yes' : 'No',
    'In Stock': product.inStock ? 'Yes' : 'No'
  }));
  
  exportToExcel(data, `products-${Date.now()}.xlsx`, 'Products');
};

export default {
  exportToPDF,
  exportToExcel,
  exportInventoryToPDF,
  exportOrdersToPDF,
  exportProductsToExcel
};
