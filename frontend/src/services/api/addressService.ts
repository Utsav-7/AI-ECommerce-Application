import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/constants';
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '../../types/address.types';
import type { ApiResponse } from '../../types/common.types';
import { handleApiError } from '../../utils/errorHandler';

export const addressService = {
  async getMyAddresses(): Promise<Address[]> {
    try {
      const response = await apiClient.get<ApiResponse<Address[]>>(API_ENDPOINTS.ADDRESSES.GET_ALL);
      if (response.data.success && response.data.data) return response.data.data;
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: number): Promise<Address> {
    try {
      const response = await apiClient.get<ApiResponse<Address>>(API_ENDPOINTS.ADDRESSES.GET_BY_ID(id));
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Address not found');
      }
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(request: CreateAddressRequest): Promise<Address> {
    try {
      const response = await apiClient.post<ApiResponse<Address>>(API_ENDPOINTS.ADDRESSES.CREATE, request);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create address');
      }
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: number, request: UpdateAddressRequest): Promise<Address> {
    try {
      const response = await apiClient.put<ApiResponse<Address>>(API_ENDPOINTS.ADDRESSES.UPDATE(id), request);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update address');
      }
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<object>>(API_ENDPOINTS.ADDRESSES.DELETE(id));
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete address');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async setDefault(id: number): Promise<Address> {
    try {
      const response = await apiClient.patch<ApiResponse<Address>>(API_ENDPOINTS.ADDRESSES.SET_DEFAULT(id));
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to set default address');
      }
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
