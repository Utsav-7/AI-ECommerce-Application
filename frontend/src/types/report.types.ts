export interface DailyStatsDto {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface StatusCountDto {
  status: string;
  count: number;
}

export interface AdminReportResponse {
  totalRevenue: number;
  totalOrders: number;
  dailyStats: DailyStatsDto[];
  ordersByStatus: StatusCountDto[];
}

export interface ProductSalesDto {
  productId: number;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface SellerReportResponse {
  totalRevenue: number;
  totalOrders: number;
  dailyStats: DailyStatsDto[];
  topProducts: ProductSalesDto[];
}

export type DateRangePreset = '7d' | '30d' | '90d';
