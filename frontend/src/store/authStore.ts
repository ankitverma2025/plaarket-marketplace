import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { AuthState, User, RegisterForm } from '@/shared/types';
import { authApi } from '@/shared/utils/api';

export const useAuthStore = create<AuthState>()(
  // persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          const response = await authApi.login(email, password);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // Set token in cookies
            Cookies.set('token', token, { 
              expires: 7, // 7 days
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error?.message || 'Login failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterForm) => {
        try {
          set({ isLoading: true });
          
          const response = await authApi.register(data.email, data.password, data.role);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // Set token in cookies
            Cookies.set('token', token, { 
              expires: 7, // 7 days
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error?.message || 'Registration failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Remove token from cookies
        Cookies.remove('token');
        
        // Clear store state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      checkAuth: async () => {
        try {
          const token = Cookies.get('token');
          
          if (!token) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          set({ isLoading: true });
          
          const response = await authApi.getMe();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, clear auth state
            Cookies.remove('token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          // Token is invalid, clear auth state
          Cookies.remove('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    })
    // {
    //   name: 'auth-storage',
    //   partialize: (state) => ({
    //     user: state.user,
    //     isAuthenticated: state.isAuthenticated,
    //   }),
    // }
  // )
);
