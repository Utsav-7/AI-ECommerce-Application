import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/constants';
import type { ApiResponse } from '../../types/common.types';
import type {
  OrderResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  PagedOrderResponse,
} from '../../types/order.types';
import { handleApiError } from '../../utils/errorHandler';

export const orderService = {
  async placeOrder(request: CreateOrderRequest): Promise<OrderResponse> {
    const response = await apiClient.post<ApiResponse<OrderResponse>>(
      API_ENDPOINTS.ORDERS.PLACE,
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to place order');
    }
    return response.data.data;
  },

  async getMyOrders(limit?: number): Promise<OrderResponse[]> {
    const params = limit ? { limit } : {};
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      API_ENDPOINTS.ORDERS.GET_MY_ORDERS,
      { params }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch orders');
    }
    return response.data.data ?? [];
  },

  async getOrderById(id: number): Promise<OrderResponse> {
    const response = await apiClient.get<ApiResponse<OrderResponse>>(
      API_ENDPOINTS.ORDERS.GET_BY_ID(id)
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Order not found');
    }
    return response.data.data;
  },

  async getOrdersForAdmin(page = 1, pageSize = 10): Promise<PagedOrderResponse> {
    const response = await apiClient.get<ApiResponse<PagedOrderResponse>>(
      API_ENDPOINTS.ORDERS.GET_ADMIN,
      { params: { page, pageSize } }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch orders');
    }
    const result = response.data.data;
    if (!result) {
      return { data: [], pageNumber: page, pageSize, totalPages: 0, totalRecords: 0 };
    }
    return result;
  },

  async getOrdersForSeller(page = 1, pageSize = 10): Promise<PagedOrderResponse> {
    const response = await apiClient.get<ApiResponse<PagedOrderResponse>>(
      API_ENDPOINTS.ORDERS.GET_SELLER,
      { params: { page, pageSize } }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch orders');
    }
    const result = response.data.data;
    if (!result) {
      return { data: [], pageNumber: page, pageSize, totalPages: 0, totalRecords: 0 };
    }
    return result;
  },

  async updateOrderStatus(
    orderId: number,
    request: UpdateOrderStatusRequest
  ): Promise<OrderResponse> {
    const response = await apiClient.put<ApiResponse<OrderResponse>>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update order status');
    }
    return response.data.data;
  },
};
