export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}
