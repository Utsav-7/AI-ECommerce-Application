export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  additionalImages?: string[];
  isActive: boolean;
  isVisible: boolean;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  sellerId: number;
  sellerName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  isActive: boolean;
  isVisible: boolean;
  stockQuantity: number;
  categoryName: string;
  sellerName: string;
  sellerId: number;
  createdAt: string;
}

export interface ProductPublic {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  additionalImages?: string[];
  stockQuantity: number;
  inStock: boolean;
  categoryName: string;
  categoryId: number;
  sellerName: string;
  sellerId: number;
  discountPercentage?: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  additionalImages?: string[];
  stockQuantity: number;
  categoryId: number;
  isActive: boolean;
  isVisible: boolean;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  additionalImages?: string[];
  stockQuantity: number;
  categoryId: number;
  isActive: boolean;
  isVisible: boolean;
}
