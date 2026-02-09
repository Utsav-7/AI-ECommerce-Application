export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  discountAmount?: number;
  totalAmount: number;
  sellerId?: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  addressId: number;
  shippingAddress: string;
  status: OrderStatus;
  statusDisplay: string;
  subTotal: number;
  discountAmount?: number;
  taxAmount: number;
  totalAmount: number;
  trackingNumber?: string;
  shippedDate?: string;
  deliveredDate?: string;
  createdAt: string;
  couponCode?: string;
  items: OrderItemResponse[];
}

export interface CreateOrderRequest {
  addressId: number;
  couponCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string;
}

export interface PagedOrderResponse {
  data: OrderResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}
