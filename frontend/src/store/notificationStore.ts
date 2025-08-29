import { create } from 'zustand';
import { NotificationState, Notification } from '@/shared/types';
import { notificationsApi } from '@/shared/utils/api';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      
      const response = await notificationsApi.getNotifications({
        limit: 50, // Get latest 50 notifications
      });
      
      if (response.success && response.data) {
        set({
          notifications: response.data.notifications || [],
          unreadCount: response.data.unreadCount || 0,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch notifications:', error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await notificationsApi.markAsRead(notificationId);
      
      if (response.success) {
        // Update local state
        const { notifications, unreadCount } = get();
        const updatedNotifications = notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );
        
        const wasUnread = notifications.find(n => n.id === notificationId && !n.isRead);
        const newUnreadCount = wasUnread ? Math.max(0, unreadCount - 1) : unreadCount;
        
        set({
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await notificationsApi.markAllAsRead();
      
      if (response.success) {
        // Update local state
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          isRead: true,
        }));
        
        set({
          notifications: updatedNotifications,
          unreadCount: 0,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      throw error;
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const response = await notificationsApi.deleteNotification(notificationId);
      
      if (response.success) {
        // Update local state
        const { notifications, unreadCount } = get();
        const notificationToDelete = notifications.find(n => n.id === notificationId);
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        
        const newUnreadCount = notificationToDelete && !notificationToDelete.isRead
          ? Math.max(0, unreadCount - 1)
          : unreadCount;
        
        set({
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to delete notification');
      }
    } catch (error) {
      throw error;
    }
  },
}));
