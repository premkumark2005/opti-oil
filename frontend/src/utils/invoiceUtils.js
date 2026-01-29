import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate invoice PDF for an order
 * @param {Object} order - Order object with all details
 */
export const generateInvoice = (order) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(24);
  doc.setTextColor(52, 152, 219);
  doc.text('OPTI-OIL', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Edible Oil Wholesale Management', 20, 27);
  
  // Invoice Title
  doc.setFontSize(20);
  doc.setTextColor(0);
  doc.text('INVOICE', 150, 20);
  
  // Invoice Details Box
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Invoice #: ${order.orderNumber}`, 150, 30);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 36);
  doc.text(`Status: ${order.orderStatus.toUpperCase()}`, 150, 42);
  
  // Customer Information
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', 20, 50);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(order.wholesaler?.businessName || order.wholesaler?.name || 'N/A', 20, 57);
  doc.text(`Contact: ${order.wholesaler?.email || 'N/A'}`, 20, 63);
  doc.text(`Phone: ${order.wholesaler?.phone || 'N/A'}`, 20, 69);
  
  if (order.shippingAddress) {
    doc.text('Shipping Address:', 20, 78);
    const addressLines = doc.splitTextToSize(order.shippingAddress, 170);
    doc.text(addressLines, 20, 84);
  }
  
  // Items Table
  const startY = order.shippingAddress ? 100 : 85;
  
  const tableData = order.items.map(item => [
    item.product?.name || 'Unknown Product',
    item.product?.sku || 'N/A',
    item.quantity,
    `$${item.unitPrice?.toFixed(2)}`,
    `$${(item.quantity * item.unitPrice).toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: startY,
    head: [['Product', 'SKU', 'Quantity', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [52, 152, 219],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    }
  });
  
  // Summary Section
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setDrawColor(200);
  doc.line(130, finalY, 190, finalY);
  
  doc.setFontSize(10);
  doc.text('Subtotal:', 130, finalY + 7);
  doc.text(`$${order.totalAmount?.toFixed(2)}`, 190, finalY + 7, { align: 'right' });
  
  // Tax (if applicable)
  const tax = order.tax || 0;
  if (tax > 0) {
    doc.text('Tax:', 130, finalY + 14);
    doc.text(`$${tax.toFixed(2)}`, 190, finalY + 14, { align: 'right' });
  }
  
  // Total
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.setDrawColor(52, 152, 219);
  doc.setLineWidth(0.5);
  doc.line(130, finalY + 18, 190, finalY + 18);
  
  doc.text('Total Amount:', 130, finalY + 25);
  doc.text(`$${(order.totalAmount + tax).toFixed(2)}`, 190, finalY + 25, { align: 'right' });
  
  // Payment Status
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const paymentStatus = order.paymentStatus || 'Pending';
  const statusColor = paymentStatus === 'paid' ? [76, 175, 80] : [255, 152, 0];
  doc.setTextColor(...statusColor);
  doc.text(`Payment Status: ${paymentStatus.toUpperCase()}`, 130, finalY + 33);
  
  // Footer
  doc.setTextColor(100);
  doc.setFontSize(8);
  const footerY = 270;
  doc.text('Thank you for your business!', 105, footerY, { align: 'center' });
  doc.text('For inquiries, please contact: support@opti-oil.com', 105, footerY + 5, { align: 'center' });
  
  // Watermark if rejected/cancelled
  if (order.orderStatus === 'rejected' || order.orderStatus === 'cancelled') {
    doc.setFontSize(60);
    doc.setTextColor(255, 0, 0, 0.1);
    doc.text(order.orderStatus.toUpperCase(), 105, 150, { 
      align: 'center',
      angle: 45 
    });
  }
  
  // Save PDF
  doc.save(`Invoice-${order.orderNumber}.pdf`);
};

/**
 * Generate packing slip for an order
 * @param {Object} order - Order object
 */
export const generatePackingSlip = (order) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('PACKING SLIP', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Order #: ${order.orderNumber}`, 20, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
  
  // Ship To
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Ship To:', 20, 55);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(order.wholesaler?.businessName || order.wholesaler?.name || 'N/A', 20, 62);
  if (order.shippingAddress) {
    const addressLines = doc.splitTextToSize(order.shippingAddress, 170);
    doc.text(addressLines, 20, 68);
  }
  
  // Items Table
  const tableData = order.items.map(item => [
    item.product?.name || 'Unknown',
    item.product?.sku || 'N/A',
    item.quantity,
    item.product?.unit || 'Unit',
    '☐' // Checkbox for picked
  ]);
  
  doc.autoTable({
    startY: 85,
    head: [['Product', 'SKU', 'Quantity', 'Unit', 'Picked']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [100, 100, 100] },
    styles: { fontSize: 10 }
  });
  
  // Signature Section
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.text('Packed By: ___________________', 20, finalY);
  doc.text('Date: ___________________', 120, finalY);
  doc.text('Signature: ___________________', 20, finalY + 15);
  
  doc.save(`PackingSlip-${order.orderNumber}.pdf`);
};

export default {
  generateInvoice,
  generatePackingSlip
};
