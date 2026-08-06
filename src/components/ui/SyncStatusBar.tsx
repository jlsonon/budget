import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SyncStatusBar() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000); // Mock sync time
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(isOffline || isSyncing) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`flex items-center justify-center px-4 py-2 text-sm font-medium ${
            isOffline 
              ? 'bg-yellow-500 text-white' 
              : 'bg-green-500 text-white'
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff className="w-4 h-4 mr-2" />
              You're offline. Changes queued.
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing changes...
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
