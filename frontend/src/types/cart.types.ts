export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  availableStock: number;
}

export interface CartResponse {
  cartId: number;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

/** Guest cart item stored in localStorage (snapshot for display without API) */
export interface GuestCartItem {
  productId: number;
  quantity: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
}
