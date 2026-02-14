import { jsPDF } from 'jspdf';
import type { AdminReportResponse, DateRangePreset } from '../types/report.types';

function getPeriodLabel(preset: DateRangePreset): string {
  switch (preset) {
    case '7d': return 'Last 7 days';
    case '30d': return 'Last 30 days';
    case '90d': return 'Last 90 days';
    case '6m': return 'Last 6 months';
    case '1y': return 'Last 1 year';
    default: return 'Report';
  }
}

export function downloadAdminReportPdf(data: AdminReportResponse, preset: DateRangePreset): void {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Admin Sales Report', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${getPeriodLabel(preset)}`, margin, y);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - margin, y, { align: 'right' });
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Revenue: Rs ${data.totalRevenue.toLocaleString('en-IN')}`, margin, y);
  y += 8;
  doc.text(`Total Orders: ${data.totalOrders}`, margin, y);
  y += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Stats', margin, y);
  y += 8;

  if (data.dailyStats?.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const colDateW = 40;
    const colOrdersW = 35;
    const colRevenueW = 50;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, colDateW, 8, 'FD');
    doc.rect(margin + colDateW, y, colOrdersW, 8, 'FD');
    doc.rect(margin + colDateW + colOrdersW, y, colRevenueW, 8, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.text('Date', margin + 2, y + 5.5);
    doc.text('Orders', margin + colDateW + 4, y + 5.5);
    doc.text('Revenue (Rs)', margin + colDateW + colOrdersW + 4, y + 5.5);
    doc.setFont('helvetica', 'normal');
    y += 8;

    data.dailyStats.forEach((row) => {
      doc.text(row.date, margin + 2, y + 5.5);
      doc.text(String(row.orderCount), margin + colDateW + 4, y + 5.5);
      doc.text(row.revenue.toLocaleString('en-IN'), margin + colDateW + colOrdersW + 4, y + 5.5);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    y += 10;
  } else {
    doc.text('No daily data', margin, y + 6);
    y += 15;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Orders by Status', margin, y);
  y += 8;

  if (data.ordersByStatus?.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const colStatusW = 60;
    const colCountW = 40;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, colStatusW, 8, 'FD');
    doc.rect(margin + colStatusW, y, colCountW, 8, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.text('Status', margin + 2, y + 5.5);
    doc.text('Count', margin + colStatusW + 8, y + 5.5);
    doc.setFont('helvetica', 'normal');
    y += 8;

    data.ordersByStatus.forEach((row) => {
      doc.text(row.status, margin + 2, y + 5.5);
      doc.text(String(row.count), margin + colStatusW + 8, y + 5.5);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  } else {
    doc.text('No status data', margin, y + 6);
  }

  doc.save(`admin-report-${preset}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
