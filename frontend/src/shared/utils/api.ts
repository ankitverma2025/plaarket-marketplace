import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse } from '@/shared/types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API helper functions
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || error.message || 'An error occurred',
        },
      };
    }
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred',
      },
    };
  }
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    }),

  register: (email: string, password: string, role: string) =>
    apiRequest({
      method: 'POST',
      url: '/auth/register',
      data: { email, password, role },
    }),

  getMe: () =>
    apiRequest({
      method: 'GET',
      url: '/auth/me',
    }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiRequest({
      method: 'PUT',
      url: '/auth/password',
      data: { currentPassword, newPassword },
    }),

  logout: () =>
    apiRequest({
      method: 'POST',
      url: '/auth/logout',
    }),
};

// Users API
export const usersApi = {
  // Profile endpoints
  getBuyerProfile: () =>
    apiRequest({
      method: 'GET',
      url: '/users/profile/buyer',
    }),

  createBuyerProfile: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/users/profile/buyer',
      data,
    }),

  updateBuyerProfile: (data: any) =>
    apiRequest({
      method: 'PUT',
      url: '/users/profile/buyer',
      data,
    }),

  getSellerProfile: () =>
    apiRequest({
      method: 'GET',
      url: '/users/profile/seller',
    }),

  createSellerProfile: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/users/profile/seller',
      data,
    }),

  updateSellerProfile: (data: any) =>
    apiRequest({
      method: 'PUT',
      url: '/users/profile/seller',
      data,
    }),

  getPublicSellerProfile: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/users/sellers/${id}`,
    }),

  getCategories: () =>
    apiRequest({
      method: 'GET',
      url: '/users/categories',
    }),

  // Admin endpoints
  getAllUsers: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/users/admin/users',
      params,
    }),

  getUserDetails: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/users/admin/users/${id}`,
    }),

  updateUserStatus: (id: string, status: string, notes?: string) =>
    apiRequest({
      method: 'PUT',
      url: `/users/admin/users/${id}/status`,
      data: { status, notes },
    }),

  getPendingSellers: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/users/admin/sellers/pending',
      params,
    }),

  getDashboardStats: () =>
    apiRequest({
      method: 'GET',
      url: '/users/admin/stats',
    }),

  createCategory: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/users/admin/categories',
      data,
    }),

  updateCategory: (id: string, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/users/admin/categories/${id}`,
      data,
    }),
};

// Products API
export const productsApi = {
  getProducts: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/products',
      params,
    }),

  getProduct: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/products/${id}`,
    }),

  createProduct: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/products',
      data,
    }),

  updateProduct: (id: string, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/products/${id}`,
      data,
    }),

  deleteProduct: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/products/${id}`,
    }),

  getSellerProducts: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/products/seller/my-products',
      params,
    }),

  updateProductStock: (id: string, stockQuantity: number) =>
    apiRequest({
      method: 'PUT',
      url: `/products/${id}/stock`,
      data: { stockQuantity },
    }),

  getFeaturedProducts: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/products/featured',
      params,
    }),
};

// Orders API
export const ordersApi = {
  // Cart endpoints
  getCart: () =>
    apiRequest({
      method: 'GET',
      url: '/orders/cart',
    }),

  addToCart: (productId: string, quantity: number) =>
    apiRequest({
      method: 'POST',
      url: '/orders/cart',
      data: { productId, quantity },
    }),

  updateCartItem: (id: string, quantity: number) =>
    apiRequest({
      method: 'PUT',
      url: `/orders/cart/${id}`,
      data: { quantity },
    }),

  removeFromCart: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/orders/cart/${id}`,
    }),

  clearCart: () =>
    apiRequest({
      method: 'DELETE',
      url: '/orders/cart',
    }),

  // Order endpoints
  createOrder: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/orders',
      data,
    }),

  getOrders: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/orders',
      params,
    }),

  getOrder: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/orders/${id}`,
    }),

  cancelOrder: (id: string) =>
    apiRequest({
      method: 'PUT',
      url: `/orders/${id}/cancel`,
    }),

  getSellerOrders: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/orders/seller/orders',
      params,
    }),

  updateOrderStatus: (id: string, status: string) =>
    apiRequest({
      method: 'PUT',
      url: `/orders/${id}/status`,
      data: { status },
    }),
};

// RFQ API
export const rfqApi = {
  createRFQ: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/rfq',
      data,
    }),

  getRFQs: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/rfq',
      params,
    }),

  getMyRFQs: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/rfq/my-rfqs',
      params,
    }),

  getRFQ: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/rfq/${id}`,
    }),

  updateRFQ: (id: string, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/rfq/${id}`,
      data,
    }),

  closeRFQ: (id: string, selectedQuoteId?: string) =>
    apiRequest({
      method: 'PUT',
      url: `/rfq/${id}/close`,
      data: { selectedQuoteId },
    }),

  deleteRFQ: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/rfq/${id}`,
    }),

  // Quote endpoints
  createQuote: (rfqId: string, data: any) =>
    apiRequest({
      method: 'POST',
      url: `/rfq/${rfqId}/quotes`,
      data,
    }),

  getQuotesForRFQ: (rfqId: string) =>
    apiRequest({
      method: 'GET',
      url: `/rfq/${rfqId}/quotes`,
    }),

  getSellerQuotes: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/rfq/seller/quotes',
      params,
    }),

  updateQuote: (id: string, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/rfq/quotes/${id}`,
      data,
    }),

  deleteQuote: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/rfq/quotes/${id}`,
    }),

  getQuote: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/rfq/quotes/${id}`,
    }),
};

// Certifications API
export const certificationsApi = {
  createCertification: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/certifications',
      data,
    }),

  getCertifications: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/certifications',
      params,
    }),

  getCertification: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/certifications/${id}`,
    }),

  updateCertification: (id: string, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/certifications/${id}`,
      data,
    }),

  deleteCertification: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/certifications/${id}`,
    }),

  linkCertificationToProduct: (id: string, productId: string) =>
    apiRequest({
      method: 'POST',
      url: `/certifications/${id}/products`,
      data: { productId },
    }),

  unlinkCertificationFromProduct: (id: string, productId: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/certifications/${id}/products/${productId}`,
    }),

  getProductCertifications: (productId: string) =>
    apiRequest({
      method: 'GET',
      url: `/certifications/product/${productId}`,
    }),

  // Admin endpoints
  getAllCertifications: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/certifications/admin/certifications',
      params,
    }),

  getPendingCertifications: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/certifications/admin/pending',
      params,
    }),

  verifyCertification: (id: string, status: string, notes?: string) =>
    apiRequest({
      method: 'PUT',
      url: `/certifications/admin/${id}/verify`,
      data: { status, notes },
    }),

  getCertificationStats: () =>
    apiRequest({
      method: 'GET',
      url: '/certifications/admin/stats',
    }),

  bulkVerifyCertifications: (certificationIds: string[], status: string, notes?: string) =>
    apiRequest({
      method: 'PUT',
      url: '/certifications/admin/bulk-verify',
      data: { certificationIds, status, notes },
    }),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/notifications',
      params,
    }),

  markAsRead: (id: string) =>
    apiRequest({
      method: 'PUT',
      url: `/notifications/${id}/read`,
    }),

  markAllAsRead: () =>
    apiRequest({
      method: 'PUT',
      url: '/notifications/mark-all-read',
    }),

  deleteNotification: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/notifications/${id}`,
    }),

  deleteAllRead: () =>
    apiRequest({
      method: 'DELETE',
      url: '/notifications/read',
    }),

  getNotificationStats: () =>
    apiRequest({
      method: 'GET',
      url: '/notifications/stats',
    }),

  getNotificationPreferences: () =>
    apiRequest({
      method: 'GET',
      url: '/notifications/preferences',
    }),

  updateNotificationPreferences: (data: any) =>
    apiRequest({
      method: 'PUT',
      url: '/notifications/preferences',
      data,
    }),

  createNotification: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/notifications',
      data,
    }),

  sendBulkNotifications: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/notifications/bulk',
      data,
    }),
};

export default api;
