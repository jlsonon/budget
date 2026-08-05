import { cn } from '../../lib/utils'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DialogProps {
  open?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-4',
}

export function Dialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  const isVisible = open ?? isOpen ?? false
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false)
    if (onClose) onClose()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'dialog-title' : undefined}
          >
            <div className={cn('w-full bg-mochi-surface rounded-2xl shadow-xl border border-mochi-border pointer-events-auto', sizeClasses[size])}>
              {/* Header */}
              {(title || description) && (
                <div className="flex items-start justify-between p-5 pb-0">
                  <div className="flex-1">
                    {title && (
                      <h2 id="dialog-title" className="text-lg font-semibold text-mochi-text">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-mochi-text-secondary">{description}</p>
                    )}
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-full hover:bg-mochi-border/50 transition-colors ml-2 touch-target"
                    aria-label="Close dialog"
                  >
                    <X className="w-4 h-4 text-mochi-text-muted" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-5 pt-0">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="px-5 pb-5 pt-0 flex gap-2">{footer}</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Dialog
