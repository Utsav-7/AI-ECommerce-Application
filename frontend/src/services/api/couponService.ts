import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/constants';
import type { Coupon, CreateCouponRequest, UpdateCouponRequest } from '../../types/coupon.types';
import type { ApiResponse, PagedResponse } from '../../types/common.types';
import { handleApiError } from '../../utils/errorHandler';

export interface CouponsPagedParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  type?: number;
}

export const couponService = {
  async getAll(): Promise<Coupon[]> {
    try {
      const response = await apiClient.get<ApiResponse<Coupon[]>>(
        API_ENDPOINTS.COUPONS.GET_ALL
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch coupons');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPaged(params: CouponsPagedParams = {}): Promise<PagedResponse<Coupon>> {
    try {
      const { page = 1, pageSize = 10, search, isActive, type } = params;
      const response = await apiClient.get<ApiResponse<PagedResponse<Coupon>>>(
        API_ENDPOINTS.COUPONS.GET_PAGED,
        { params: { page, pageSize, search: search || undefined, isActive, type } }
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch coupons');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: number): Promise<Coupon> {
    try {
      const response = await apiClient.get<ApiResponse<Coupon>>(
        API_ENDPOINTS.COUPONS.GET_BY_ID(id)
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch coupon');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateCouponRequest): Promise<Coupon> {
    try {
      const response = await apiClient.post<ApiResponse<Coupon>>(
        API_ENDPOINTS.COUPONS.CREATE,
        data
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create coupon');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: number, data: UpdateCouponRequest): Promise<Coupon> {
    try {
      const response = await apiClient.put<ApiResponse<Coupon>>(
        API_ENDPOINTS.COUPONS.UPDATE(id),
        data
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update coupon');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        API_ENDPOINTS.COUPONS.DELETE(id)
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete coupon');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
