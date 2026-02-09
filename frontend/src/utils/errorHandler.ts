import axios from 'axios';
import type { ApiResponse } from '../types/common.types';

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as Record<string, unknown>;
      const message = data.message ?? data.Message;
      if (typeof message === 'string' && message) {
        return message;
      }
      const errors = data.errors ?? data.Errors;
      if (Array.isArray(errors) && errors.length > 0) {
        return errors.map(String).join(', ');
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

