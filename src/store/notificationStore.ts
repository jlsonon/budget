import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification } from '@/types'

export interface NotificationState {
  notifications: AppNotification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  addNotification: (notification: AppNotification) => void
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'welcome_notif',
    userId: 'current',
    title: 'Welcome to Mochi Money!',
    message: 'Track expenses, create savings goals, and manage your budget with private local AI.',
    type: 'insight',
    read: false,
    date: new Date().toISOString(),
  },
]

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearAll: () => set({ notifications: [] }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
    }),
    {
      name: 'mochi-notifications-storage',
    }
  )
)
