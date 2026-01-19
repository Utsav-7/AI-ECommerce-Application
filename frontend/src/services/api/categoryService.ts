import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/constants';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/category.types';
import type { ApiResponse } from '../../types/common.types';
import { handleApiError } from '../../utils/errorHandler';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>(
        API_ENDPOINTS.CATEGORIES.GET_ALL
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch categories');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: number): Promise<Category> {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.GET_BY_ID(id)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch category');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await apiClient.post<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.CREATE,
        data
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to create category');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: number, data: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await apiClient.put<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.UPDATE(id),
        data
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to update category');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        API_ENDPOINTS.CATEGORIES.DELETE(id)
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete category');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
