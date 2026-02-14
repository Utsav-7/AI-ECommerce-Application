import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { reportService } from '../../../services/api/reportService';
import { downloadAdminReportPdf } from '../../../utils/adminReportPdf';
import type { AdminReportResponse, DateRangePreset } from '../../../types/report.types';
import styles from './ReportSection.module.css';

const CHART_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

function getDateRange(preset: DateRangePreset): { from: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  if (preset === '7d') from.setDate(from.getDate() - 7);
  else if (preset === '30d') from.setDate(from.getDate() - 30);
  else if (preset === '90d') from.setDate(from.getDate() - 90);
  else if (preset === '6m') from.setMonth(from.getMonth() - 6);
  else if (preset === '1y') from.setFullYear(from.getFullYear() - 1);
  else from.setDate(from.getDate() - 90);
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

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

function formatChartDate(s: string): string {
  const d = new Date(s);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

interface AdminReportSectionProps {
  className?: string;
}

const AdminReportSection: React.FC<AdminReportSectionProps> = ({ className }) => {
  const [preset, setPreset] = useState<DateRangePreset>('30d');
  const [data, setData] = useState<AdminReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getDateRange(preset);
      const result = await reportService.getAdminReport(from, to);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [preset]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const lineData = data?.dailyStats?.map((d) => ({
    date: formatChartDate(d.date),
    orders: d.orderCount,
    revenue: d.revenue,
  })) ?? [];

  const barData = data?.ordersByStatus?.map((d) => ({
    name: d.status,
    count: d.count,
  })) ?? [];

  const downloadPdf = () => {
    if (!data) return;
    downloadAdminReportPdf(data, preset);
  };

  const downloadExcel = () => {
    if (!data) return;
    const rows: string[][] = [
      ['Admin Sales Report', ''],
      ['Period', getPeriodLabel(preset)],
      ['Total Revenue', `₹${data.totalRevenue.toLocaleString('en-IN')}`],
      ['Total Orders', String(data.totalOrders)],
      [],
      ['Date', 'Orders', 'Revenue (₹)'],
      ...(data.dailyStats?.map((d) => [d.date, String(d.orderCount), String(d.revenue)]) ?? []),
      [],
      ['Orders by Status', 'Count'],
      ...(data.ordersByStatus?.map((s) => [s.status, String(s.count)]) ?? []),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${preset}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={`${styles.reportSection} ${className ?? ''}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>📈 Reports</h3>
        <div className={styles.controls}>
          <select
            className={styles.dateRangeSelect}
            value={preset}
            onChange={(e) => setPreset(e.target.value as DateRangePreset)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last 1 year</option>
          </select>
          <button
            className={styles.dateRangeSelect}
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            className={styles.downloadButton}
            onClick={downloadPdf}
            disabled={!data || loading}
            title="Download report as PDF"
          >
            📄 Download PDF
          </button>
          <button
            className={styles.downloadButton}
            onClick={downloadExcel}
            disabled={!data || loading}
            title="Download report as Excel (CSV)"
          >
            📊 Download Excel
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {!error && data && (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Total Revenue</p>
              <p className={styles.statBoxValue}>₹{data.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className={styles.statBox}>
              <p className={styles.statBoxLabel}>Total Orders</p>
              <p className={styles.statBoxValue}>{data.totalOrders}</p>
            </div>
          </div>

          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <h4 className={styles.chartTitle}>Orders & Revenue Over Time</h4>
              <div className={styles.chartWrapper}>
                {loading ? (
                  <div className={styles.loadingBox}>Loading...</div>
                ) : lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                        formatter={(value: number, name: string) => [
                          name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : value,
                          name === 'revenue' ? 'Revenue' : 'Orders',
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="orders" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} name="orders" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 4 }} name="revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.loadingBox}>No data for selected period</div>
                )}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h4 className={styles.chartTitle}>Orders by Status</h4>
              <div className={styles.chartWrapper}>
                {loading ? (
                  <div className={styles.loadingBox}>Loading...</div>
                ) : barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                        formatter={(value: number) => [value, 'Count']}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {barData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.loadingBox}>No data for selected period</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default AdminReportSection;
