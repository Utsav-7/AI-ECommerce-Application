export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PagedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
