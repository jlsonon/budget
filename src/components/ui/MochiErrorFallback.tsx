import { Mascot } from './Mascot'
import { RefreshCw } from 'lucide-react'

interface MochiErrorFallbackProps {
  error: Error | null
  resetErrorBoundary: () => void
}

export default function MochiErrorFallback({ error, resetErrorBoundary }: MochiErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6">
      <Mascot mood="sad" size="xl" animate={true} />

      <div className="space-y-2">
        <h2 className="text-xl font-black text-mochi-text">Oops! Something got squished</h2>
        <p className="text-mochi-text-secondary text-sm max-w-sm mx-auto">
          We hit a little snag. Don't worry — your data is safe.
        </p>
      </div>

      {error && (
        <div className="bg-mochi-error/10 text-mochi-error border border-mochi-error/30 p-3 rounded-xl text-xs max-w-sm w-full font-mono break-all">
          {error.message}
        </div>
      )}

      <button
        onClick={resetErrorBoundary}
        className="mochi-btn-primary flex items-center gap-2 min-w-[200px]"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  )
}
