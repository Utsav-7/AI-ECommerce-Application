import apiClient from './apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../utils/constants';
import { authService } from './authService';
import type {
  CartResponse,
  CartItemResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  GuestCartItem,
} from '../../types/cart.types';
import type { ApiResponse } from '../../types/common.types';
import { handleApiError } from '../../utils/errorHandler';

const GUEST_CART_KEY = STORAGE_KEYS.GUEST_CART;

function getGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setGuestCart(items: GuestCartItem[]): void {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

/** True if current user is a customer (User role) and can use cart API */
function isCustomer(): boolean {
  if (!authService.isAuthenticated()) return false;
  const user = authService.getUserInfo();
  return user?.role === 'User';
}

/** Build CartResponse from guest cart items (id = productId for guest items) */
function guestCartToResponse(items: GuestCartItem[]): CartResponse {
  const cartItems: CartItemResponse[] = items.map((it) => ({
    id: it.productId,
    productId: it.productId,
    productName: it.productName,
    imageUrl: it.imageUrl,
    unitPrice: it.unitPrice,
    quantity: it.quantity,
    subtotal: it.unitPrice * it.quantity,
    availableStock: 999,
  }));
  return {
    cartId: 0,
    items: cartItems,
    totalItems: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: cartItems.reduce((sum, i) => sum + i.subtotal, 0),
  };
}

export const cartService = {
  /** Get cart: from API for logged-in customer, from localStorage for guest */
  async getCart(): Promise<CartResponse> {
    if (isCustomer()) {
      try {
        const response = await apiClient.get<ApiResponse<CartResponse>>(API_ENDPOINTS.CART.GET);
        if (response.data.success && response.data.data) return response.data.data;
        return { cartId: 0, items: [], totalItems: 0, subtotal: 0 };
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
    return guestCartToResponse(getGuestCart());
  },

  /**
   * Add item to cart. For guest, productSnapshot is required for display.
   * For customer, API validates stock.
   */
  async addItem(
    productId: number,
    quantity: number,
    productSnapshot?: { productName: string; imageUrl?: string; unitPrice: number }
  ): Promise<CartResponse> {
    if (isCustomer()) {
      try {
        const request: AddToCartRequest = { productId, quantity };
        const response = await apiClient.post<ApiResponse<CartResponse>>(
          API_ENDPOINTS.CART.ADD_ITEM,
          request
        );
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to add to cart');
        }
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }

    const guest = getGuestCart();
    const existing = guest.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      if (!productSnapshot) {
        throw new Error('Product details required for guest cart');
      }
      guest.push({
        productId,
        quantity,
        productName: productSnapshot.productName,
        imageUrl: productSnapshot.imageUrl,
        unitPrice: productSnapshot.unitPrice,
      });
    }
    setGuestCart(guest);
    return guestCartToResponse(guest);
  },

  /**
   * Update quantity. For API, id is cartItemId. For guest, id is productId.
   */
  async updateQuantity(id: number, quantity: number, isGuestProductId = false): Promise<CartResponse> {
    if (isCustomer() && !isGuestProductId) {
      try {
        const request: UpdateCartItemRequest = { quantity };
        const response = await apiClient.put<ApiResponse<CartResponse>>(
          API_ENDPOINTS.CART.UPDATE_ITEM(id),
          request
        );
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to update cart');
        }
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }

    const guest = getGuestCart();
    const idx = guest.findIndex((i) => i.productId === id);
    if (idx === -1) return guestCartToResponse(guest);
    if (quantity < 1) {
      guest.splice(idx, 1);
    } else {
      guest[idx].quantity = quantity;
    }
    setGuestCart(guest);
    return guestCartToResponse(guest);
  },

  /**
   * Remove item. For API, id is cartItemId. For guest, id is productId.
   */
  async removeItem(id: number, isGuestProductId = false): Promise<CartResponse> {
    if (isCustomer() && !isGuestProductId) {
      try {
        const response = await apiClient.delete<ApiResponse<CartResponse>>(
          API_ENDPOINTS.CART.REMOVE_ITEM(id)
        );
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to remove item');
        }
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }

    const guest = getGuestCart().filter((i) => i.productId !== id);
    setGuestCart(guest);
    return guestCartToResponse(guest);
  },

  async clearCart(): Promise<CartResponse> {
    if (isCustomer()) {
      try {
        const response = await apiClient.delete<ApiResponse<CartResponse>>(API_ENDPOINTS.CART.CLEAR);
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to clear cart');
        }
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
    setGuestCart([]);
    return { cartId: 0, items: [], totalItems: 0, subtotal: 0 };
  },

  /** Whether current user can use cart API (logged-in customer) */
  isCustomer,

  /** Get total item count without full cart (for navbar). Uses API for customer, localStorage for guest. */
  async getCartCount(): Promise<number> {
    if (isCustomer()) {
      try {
        const cart = await this.getCart();
        return cart.totalItems;
      } catch {
        return 0;
      }
    }
    const guest = getGuestCart();
    return guest.reduce((sum, i) => sum + i.quantity, 0);
  },
};
