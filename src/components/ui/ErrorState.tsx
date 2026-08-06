import Mascot from './Mascot'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not fetch your financial data right now.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Mascot mood="sad" size="md" />
      <h3 className="text-lg font-bold text-mochi-text mt-4">{title}</h3>
      <p className="text-xs text-mochi-text-muted mt-1 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-xl bg-mochi-primary text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
