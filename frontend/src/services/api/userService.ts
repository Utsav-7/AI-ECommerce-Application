import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/constants';
import type { User, UserListItem, PendingSeller, UpdateUserRequest, DashboardStats } from '../../types/user.types';
import type { ApiResponse, PagedResponse } from '../../types/common.types';
import { handleApiError } from '../../utils/errorHandler';

export interface UsersPagedParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface PendingSellersPagedParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const userService = {
  async getAll(): Promise<UserListItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserListItem[]>>(
        API_ENDPOINTS.USERS.GET_ALL
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch users');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        API_ENDPOINTS.USERS.GET_BY_ID(id)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch user');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getByRole(role: string): Promise<UserListItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserListItem[]>>(
        API_ENDPOINTS.USERS.GET_BY_ROLE(role)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch users');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPendingSellers(): Promise<PendingSeller[]> {
    try {
      const response = await apiClient.get<ApiResponse<PendingSeller[]>>(
        API_ENDPOINTS.USERS.GET_PENDING_SELLERS
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch pending sellers');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPaged(params: UsersPagedParams = {}): Promise<PagedResponse<UserListItem>> {
    try {
      const { page = 1, pageSize = 10, search, role, isActive } = params;
      const response = await apiClient.get<ApiResponse<PagedResponse<UserListItem>>>(
        API_ENDPOINTS.USERS.GET_PAGED,
        { params: { page, pageSize, search: search || undefined, role: role || undefined, isActive } }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch users');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPendingSellersPaged(params: PendingSellersPagedParams = {}): Promise<PagedResponse<PendingSeller>> {
    try {
      const { page = 1, pageSize = 10, search } = params;
      const response = await apiClient.get<ApiResponse<PagedResponse<PendingSeller>>>(
        API_ENDPOINTS.USERS.GET_PENDING_SELLERS_PAGED,
        { params: { page, pageSize, search: search || undefined } }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch pending sellers');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        API_ENDPOINTS.USERS.GET_STATS
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch stats');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: number, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        API_ENDPOINTS.USERS.UPDATE(id),
        data
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to update user');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateStatus(id: number, isActive: boolean): Promise<User> {
    try {
      const response = await apiClient.patch<ApiResponse<User>>(
        API_ENDPOINTS.USERS.UPDATE_STATUS(id),
        isActive
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to update user status');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async approveSeller(id: number): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        API_ENDPOINTS.USERS.APPROVE_SELLER(id)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to approve seller');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async rejectSeller(id: number, reason?: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        API_ENDPOINTS.USERS.REJECT_SELLER(id),
        reason || null
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reject seller');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        API_ENDPOINTS.USERS.DELETE(id)
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
