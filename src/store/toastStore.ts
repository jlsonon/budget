import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'remove' | 'transfer'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  onUndo?: () => void
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  remove: (message: string, title?: string, onUndo?: () => void) => void
  transfer: (message: string, title?: string) => void
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const currentToasts = get().toasts
    if (currentToasts.some((t) => t.message === toast.message)) {
      return
    }

    const id = crypto.randomUUID()
    const newToast: Toast = { ...toast, id, duration: toast.duration || 3500 }
    set((state) => ({ toasts: [...state.toasts, newToast] }))

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, newToast.duration)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  success: (message, title) =>
    useToastStore.getState().addToast({ type: 'success', message, title }),
  error: (message, title) =>
    useToastStore.getState().addToast({ type: 'error', message, title }),
  warning: (message, title) =>
    useToastStore.getState().addToast({ type: 'warning', message, title }),
  info: (message, title) =>
    useToastStore.getState().addToast({ type: 'info', message, title }),
  remove: (message, title, onUndo) =>
    useToastStore.getState().addToast({ type: 'remove', message, title, onUndo }),
  transfer: (message, title) =>
    useToastStore.getState().addToast({ type: 'transfer', message, title }),
}))
