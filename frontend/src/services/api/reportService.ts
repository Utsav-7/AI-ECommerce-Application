import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/constants';
import type { ApiResponse } from '../../types/common.types';
import type { AdminReportResponse, SellerReportResponse } from '../../types/report.types';

function toQueryDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export const reportService = {
  async getAdminReport(from?: Date, to?: Date): Promise<AdminReportResponse> {
    const params: Record<string, string> = {};
    if (from) params.from = toQueryDate(from);
    if (to) params.to = toQueryDate(to);
    const response = await apiClient.get<ApiResponse<AdminReportResponse>>(
      API_ENDPOINTS.REPORTS.ADMIN,
      { params }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch report');
    }
    return response.data.data;
  },

  async getSellerReport(from?: Date, to?: Date): Promise<SellerReportResponse> {
    const params: Record<string, string> = {};
    if (from) params.from = toQueryDate(from);
    if (to) params.to = toQueryDate(to);
    const response = await apiClient.get<ApiResponse<SellerReportResponse>>(
      API_ENDPOINTS.REPORTS.SELLER,
      { params }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch report');
    }
    return response.data.data;
  },
};
