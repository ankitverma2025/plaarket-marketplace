import { create } from 'zustand';
import { CartState, CartItem } from '@/shared/types';
import { ordersApi } from '@/shared/utils/api';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  summary: {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
  },

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      
      const response = await ordersApi.getCart();
      
      if (response.success && response.data) {
        set({
          items: response.data.items || [],
          summary: response.data.summary || {
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            itemCount: 0,
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch cart:', error);
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    try {
      const response = await ordersApi.addToCart(productId, quantity);
      
      if (response.success) {
        // Refresh cart after adding item
        await get().fetchCart();
      } else {
        throw new Error(response.error?.message || 'Failed to add item to cart');
      }
    } catch (error) {
      throw error;
    }
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    try {
      const response = await ordersApi.updateCartItem(itemId, quantity);
      
      if (response.success) {
        // Refresh cart after updating item
        await get().fetchCart();
      } else {
        throw new Error(response.error?.message || 'Failed to update cart item');
      }
    } catch (error) {
      throw error;
    }
  },

  removeFromCart: async (itemId: string) => {
    try {
      const response = await ordersApi.removeFromCart(itemId);
      
      if (response.success) {
        // Refresh cart after removing item
        await get().fetchCart();
      } else {
        throw new Error(response.error?.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const response = await ordersApi.clearCart();
      
      if (response.success) {
        set({
          items: [],
          summary: {
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            itemCount: 0,
          },
        });
      } else {
        throw new Error(response.error?.message || 'Failed to clear cart');
      }
    } catch (error) {
      throw error;
    }
  },
}));
