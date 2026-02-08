export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  lastRestockedDate: string | null;
}

export interface SellerInventoryStats {
  totalItems: number;
  totalProducts: number;
  lowStockCount: number;
}
