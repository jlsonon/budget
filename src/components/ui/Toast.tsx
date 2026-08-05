import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastProps extends Toast {
  onClose: (id: string) => void
}

const typeConfig: Record<ToastType, { icon: typeof CheckCircle; bgColor: string; borderColor: string }> = {
  success: { icon: CheckCircle, bgColor: 'bg-mochi-success/10', borderColor: 'border-mochi-success' },
  error: { icon: XCircle, bgColor: 'bg-mochi-error/10', borderColor: 'border-mochi-error' },
  warning: { icon: AlertCircle, bgColor: 'bg-mochi-warning/10', borderColor: 'border-mochi-warning' },
  info: { icon: Info, bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500' },
}

function ToastItem({ id, type, title, message, onClose }: ToastProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm',
        config.bgColor,
        config.borderColor
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', `text-${type === 'success' ? 'mochi-success' : type === 'error' ? 'mochi-error' : type === 'warning' ? 'mochi-warning' : 'blue-500'}`)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-mochi-text">{title}</p>
        {message && <p className="mt-0.5 text-xs text-mochi-text-secondary">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-full hover:bg-black/10 transition-colors touch-target"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-mochi-text-muted" />
      </button>
    </motion.div>
  )
}

// Simple toast store
let toasts: Toast[] = []
let listeners: (() => void)[] = []

function notify() {
  listeners.forEach((l) => l())
}

export function useToast() {
  const [, setToasts] = useState<Toast[]>(toasts)

  useEffect(() => {
    const listener = () => setToasts([...toasts])
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID?.() ?? Date.now().toString()
    const newToast = { ...toast, id }
    toasts = [...toasts, newToast]
    notify()

    const duration = toast.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id)
        notify()
      }, duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }

  return { toasts, addToast, removeToast }
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
