import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '../../store/toastStore'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-mochi-success flex-shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-mochi-error flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-mochi-warning flex-shrink-0" />,
}

const styles = {
  success: 'bg-mochi-success/10 border-mochi-success/30',
  error: 'bg-mochi-error/10 border-mochi-error/30',
  info: 'bg-sky-500/10 border-sky-500/30',
  warning: 'bg-mochi-warning/10 border-mochi-warning/30',
}

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[90] flex flex-col gap-2 w-full max-w-sm px-4 md:left-auto md:right-6 md:-translate-x-0 pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-xl bg-mochi-surface/95 ${styles[toast.type]}`}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-sm font-bold text-mochi-text leading-tight">{toast.title}</h4>
              )}
              <p className="text-sm text-mochi-text-secondary leading-snug mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-mochi-border/60 text-mochi-text-muted hover:text-mochi-text transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
