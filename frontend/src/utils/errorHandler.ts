import axios from 'axios';
import type { ApiResponse } from '../types/common.types';

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const apiResponse = error.response.data as ApiResponse<any>;
      if (apiResponse.message) {
        return apiResponse.message;
      }
      if (apiResponse.errors && apiResponse.errors.length > 0) {
        return apiResponse.errors.join(', ');
      }
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

