import axios from 'axios';
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/constants';
import type { InventoryItem, SellerInventoryStats } from '../../types/inventory.types';
import type { ApiResponse } from '../../types/common.types';
import { handleApiError } from '../../utils/errorHandler';

export const inventoryService = {
  async getSellerInventory(signal?: AbortSignal): Promise<InventoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<InventoryItem[]>>(
        API_ENDPOINTS.INVENTORIES.GET_SELLER,
        { signal }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch inventory');
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      throw new Error(handleApiError(error));
    }
  },

  async getSellerStats(signal?: AbortSignal): Promise<SellerInventoryStats> {
    try {
      const response = await apiClient.get<ApiResponse<SellerInventoryStats>>(
        API_ENDPOINTS.INVENTORIES.GET_SELLER_STATS,
        { signal }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch inventory stats');
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      throw new Error(handleApiError(error));
    }
  },
};
