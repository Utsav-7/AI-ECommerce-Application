import { jsPDF } from 'jspdf';
import type { OrderResponse } from '../types/order.types';

const CURRENCY = 'Rs ';

function fmtAmount(n: number): string {
  return CURRENCY + n.toLocaleString('en-IN');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function downloadOrderBillPdf(order: OrderResponse): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const bottomMargin = 25;
  let y = 20;

  const tableWidth = pageWidth - 2 * margin;
  const colQtyW = 32;
  const colRateW = 48;
  const colTotalW = 50;
  const colProductW = tableWidth - colQtyW - colRateW - colTotalW;
  const colProductEnd = margin + colProductW;
  const colQtyEnd = colProductEnd + colQtyW;
  const colRateEnd = colQtyEnd + colRateW;

  const addPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - bottomMargin) {
      doc.addPage();
      y = 20;
      drawTableHeader();
    }
  };

  const drawTableHeader = () => {
    const rowH = 10;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, colProductW, rowH, 'FD');
    doc.rect(colProductEnd, y, colQtyW, rowH, 'FD');
    doc.rect(colQtyEnd, y, colRateW, rowH, 'FD');
    doc.rect(colRateEnd, y, colTotalW, rowH, 'FD');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, tableWidth, rowH, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Product', margin + 3, y + 6.5);
    doc.text('Qty', colProductEnd + colQtyW / 2, y + 6.5, { align: 'center' });
    doc.text('Rate', colQtyEnd + colRateW / 2, y + 6.5, { align: 'center' });
    doc.text('Total', colRateEnd + colTotalW / 2, y + 6.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    y += rowH;
  };

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Bill', pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #${order.orderNumber}`, margin, y);
  doc.text(formatDate(order.createdAt), pageWidth - margin, y, { align: 'right' });
  y += 10;

  doc.text(`Status: ${order.statusDisplay}`, margin, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Bill To', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName, margin, y);
  y += 6;
  doc.text(order.customerEmail, margin, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Shipping Address', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(order.shippingAddress, colProductW - 6);
  doc.text(addressLines, margin, y);
  y += addressLines.length * 6 + 10;

  drawTableHeader();

  for (const item of order.items) {
    addPageIfNeeded(20);
    const nameLines = doc.splitTextToSize(item.productName, colProductW - 6);
    const rowH = Math.max(nameLines.length * 6 + 6, 12);

    doc.setDrawColor(220, 220, 220);
    doc.rect(margin, y, colProductW, rowH, 'S');
    doc.rect(colProductEnd, y, colQtyW, rowH, 'S');
    doc.rect(colQtyEnd, y, colRateW, rowH, 'S');
    doc.rect(colRateEnd, y, colTotalW, rowH, 'S');

    doc.text(nameLines, margin + 3, y + 5);
    doc.text(item.quantity.toLocaleString('en-IN'), colProductEnd + colQtyW / 2, y + rowH / 2 + 2, { align: 'center' });
    doc.text(fmtAmount(item.unitPrice), colQtyEnd + colRateW / 2, y + rowH / 2 + 2, { align: 'center' });
    doc.text(fmtAmount(item.totalAmount), colRateEnd + colTotalW / 2, y + rowH / 2 + 2, { align: 'center' });
    y += rowH;
  }

  y += 10;

  addPageIfNeeded(60);
  doc.text('Subtotal:', margin, y);
  doc.text(fmtAmount(order.subTotal), colRateEnd + colTotalW / 2, y, { align: 'center' });
  y += 7;

  if (order.discountAmount && order.discountAmount > 0) {
    doc.text('Discount:', margin, y);
    doc.setTextColor(5, 150, 105);
    doc.text('-' + fmtAmount(order.discountAmount), colRateEnd + colTotalW / 2, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 7;
  }

  if (order.taxAmount && order.taxAmount > 0) {
    doc.text('Tax:', margin, y);
    doc.text(fmtAmount(order.taxAmount), colRateEnd + colTotalW / 2, y, { align: 'center' });
    y += 7;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', margin, y + 2);
  doc.text(fmtAmount(order.totalAmount), colRateEnd + colTotalW / 2, y + 2, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  y += 15;

  if (order.trackingNumber) {
    doc.text(`Tracking #: ${order.trackingNumber}`, margin, y);
    y += 6;
  }
  if (order.shippedDate) {
    doc.text(`Shipped: ${formatDate(order.shippedDate)}`, margin, y);
    y += 6;
  }
  if (order.deliveredDate) {
    doc.text(`Delivered: ${formatDate(order.deliveredDate)}`, margin, y);
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Order #${order.orderNumber}`, margin, pageHeight - 10);
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`Order-${order.orderNumber}-Bill.pdf`);
}
