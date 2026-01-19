import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/constants';
import type { 
  Product, 
  ProductListItem, 
  ProductPublic, 
  CreateProductRequest, 
  UpdateProductRequest 
} from '../../types/product.types';
import type { ApiResponse } from '../../types/common.types';
import { handleApiError } from '../../utils/errorHandler';

export const productService = {
  // ========== Public Endpoints (No Auth Required) ==========
  
  async getPublicProducts(): Promise<ProductPublic[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductPublic[]>>(
        API_ENDPOINTS.PRODUCTS.PUBLIC_GET_ALL
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getPublicProductById(id: number): Promise<ProductPublic> {
    try {
      const response = await apiClient.get<ApiResponse<ProductPublic>>(
        API_ENDPOINTS.PRODUCTS.PUBLIC_GET_BY_ID(id)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch product');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductPublic[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductPublic[]>>(
        API_ENDPOINTS.PRODUCTS.PUBLIC_GET_BY_CATEGORY(categoryId)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async searchProducts(query: string): Promise<ProductPublic[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductPublic[]>>(
        `${API_ENDPOINTS.PRODUCTS.PUBLIC_SEARCH}?q=${encodeURIComponent(query)}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to search products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ========== Admin/Seller Endpoints ==========

  async getAll(): Promise<ProductListItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductListItem[]>>(
        API_ENDPOINTS.PRODUCTS.GET_ALL
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: number): Promise<Product> {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch product');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getMyProducts(): Promise<ProductListItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductListItem[]>>(
        API_ENDPOINTS.PRODUCTS.GET_MY_PRODUCTS
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getProductsBySeller(sellerId: number): Promise<ProductListItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductListItem[]>>(
        API_ENDPOINTS.PRODUCTS.GET_BY_SELLER(sellerId)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch products');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateProductRequest): Promise<Product> {
    try {
      const response = await apiClient.post<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.CREATE,
        data
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to create product');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: number, data: UpdateProductRequest): Promise<Product> {
    try {
      const response = await apiClient.put<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.UPDATE(id),
        data
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to update product');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(
        API_ENDPOINTS.PRODUCTS.DELETE(id)
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async toggleStatus(id: number): Promise<Product> {
    try {
      const response = await apiClient.patch<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.TOGGLE_STATUS(id)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to toggle product status');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async toggleVisibility(id: number): Promise<Product> {
    try {
      const response = await apiClient.patch<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.TOGGLE_VISIBILITY(id)
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to toggle product visibility');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
