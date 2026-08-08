import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore, type ToastType } from '../../store/toastStore'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Trash2,
  ArrowLeftRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react'

const icons: Record<ToastType, JSX.Element> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  remove: <Trash2 className="w-5 h-5 text-rose-500 flex-shrink-0" />,
  transfer: <ArrowLeftRight className="w-5 h-5 text-sky-500 flex-shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  info: <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0" />,
}

const styles: Record<ToastType, string> = {
  success: 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/5',
  remove: 'bg-rose-500/10 border-rose-500/30 shadow-rose-500/5',
  transfer: 'bg-sky-500/10 border-sky-500/30 shadow-sky-500/5',
  error: 'bg-rose-500/10 border-rose-500/30 shadow-rose-500/5',
  warning: 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/5',
  info: 'bg-indigo-500/10 border-indigo-500/30 shadow-indigo-500/5',
}

const badgeStyles: Record<ToastType, string> = {
  success: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  remove: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
  transfer: 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30',
  error: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
  warning: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  info: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
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
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl bg-mochi-surface/95 ${styles[toast.type]}`}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeStyles[toast.type]}`}>
                  {toast.type}
                </span>
                {toast.title && (
                  <h4 className="text-xs font-black text-mochi-text leading-tight truncate">
                    {toast.title}
                  </h4>
                )}
              </div>
              <p className="text-xs text-mochi-text-secondary leading-snug font-semibold">{toast.message}</p>

              {toast.onUndo && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      toast.onUndo?.()
                      removeToast(toast.id)
                    }}
                    className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 text-[10px] font-black border border-rose-500/30 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" /> Undo Action
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-mochi-border/60 text-mochi-text-muted hover:text-mochi-text transition-colors cursor-pointer"
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
