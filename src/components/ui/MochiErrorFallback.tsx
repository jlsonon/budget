import { Mascot } from './Mascot';

interface MochiErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

export default function MochiErrorFallback({ error, resetErrorBoundary }: MochiErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6">
      <Mascot mood="sad" size="xl" animate={true} />
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Oops! Something got squished</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          We hit a little snag. Our Mochi engineers are on it!
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm max-w-sm w-full truncate overflow-hidden">
          {error.message}
        </div>
      )}

      <button
        onClick={resetErrorBoundary}
        className="mochi-btn min-w-[200px] bg-primary text-white py-3 px-6 rounded-full font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
