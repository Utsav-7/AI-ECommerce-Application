import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api/authService';
import { orderService } from '../../../services/api/orderService';
import { toastService } from '../../../services/toast/toastService';
import { UserRoleValues } from '../../../types/auth.types';
import type { OrderResponse, OrderStatus, UpdateOrderStatusRequest } from '../../../types/order.types';
import OrderDetailModal from '../../../components/common/OrderDetailModal';
import styles from './Orders.module.css';

const PAGE_SIZE = 10;
const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const isSellerRole = (role: string | number | undefined): boolean => {
  if (!role) return false;
  if (typeof role === 'string') return role === UserRoleValues.Seller;
  if (typeof role === 'number') return role === 2;
  return false;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const SellerOrders: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderResponse | null>(null);
  const [statusForm, setStatusForm] = useState<UpdateOrderStatusRequest>({
    status: 'Pending',
    trackingNumber: '',
  });

  const fetchOrders = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const result = await orderService.getOrdersForSeller(pageNum, PAGE_SIZE);
      setOrders(result.data ?? []);
      setTotalPages(result.totalPages ?? 0);
      setTotalRecords(result.totalRecords ?? 0);
      setPage(pageNum);
    } catch (e) {
      toastService.error(e instanceof Error ? e.message : 'Failed to load orders');
      setOrders([]);
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated() || !isSellerRole(userInfo?.role)) {
      navigate('/');
      return;
    }
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount and role change
  }, [navigate, userInfo?.role]);

  const handleUpdateStatus = async (orderId: number) => {
    try {
      await orderService.updateOrderStatus(orderId, statusForm);
      toastService.success('Order status updated');
      setEditingId(null);
      fetchOrders(page);
    } catch (e) {
      toastService.error(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  const openEdit = (order: OrderResponse) => {
    setEditingId(order.id);
    setStatusForm({
      status: order.status,
      trackingNumber: order.trackingNumber ?? '',
    });
  };

  if (!userInfo) return null;

  return (
    <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>My Orders</h1>
          <span className={styles.userName}>{userInfo.firstName} {userInfo.lastName}</span>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading orders...</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>My Items</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className={styles.orderNum}>{order.orderNumber}</td>
                        <td>
                          <div>{order.customerName}</div>
                          <div className={styles.email}>{order.customerEmail}</div>
                        </td>
                        <td className={styles.itemsCol}>
                          {order.items?.length
                            ? order.items.length === 1
                              ? `${order.items[0].productName} × ${order.items[0].quantity}`
                              : `${order.items[0].productName} × ${order.items[0].quantity} ....`
                            : '—'}
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={styles.statusBadge} data-status={order.status}>
                            {order.statusDisplay}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button onClick={() => setViewingOrder(order)} className={styles.viewBtn}>View</button>
                            {editingId === order.id ? (
                              <div className={styles.editForm}>
                                <select
                                  value={statusForm.status}
                                  onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value as OrderStatus }))}
                                  className={styles.select}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder="Tracking #"
                                  value={statusForm.trackingNumber}
                                  onChange={(e) => setStatusForm((f) => ({ ...f, trackingNumber: e.target.value }))}
                                  className={styles.input}
                                />
                                <div className={styles.editActions}>
                                  <button onClick={() => handleUpdateStatus(order.id)} className={styles.saveBtn}>Save</button>
                                  <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => openEdit(order)} className={styles.actionBtn}>Update</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    disabled={page <= 1}
                    onClick={() => fetchOrders(page - 1)}
                    className={styles.pageBtn}
                  >
                    Previous
                  </button>
                  <span className={styles.pageInfo}>
                    Page {page} of {totalPages} ({totalRecords} orders)
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => fetchOrders(page + 1)}
                    className={styles.pageBtn}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      <OrderDetailModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
    </div>
  );
};

export default SellerOrders;
