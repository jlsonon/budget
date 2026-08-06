interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl ${className}`} />
  );
}

export function TransactionListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 mochi-card bg-white dark:bg-gray-900">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function WalletCardSkeleton() {
  return (
    <div className="mochi-card p-6 bg-white dark:bg-gray-900 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function BudgetBarSkeleton() {
  return (
    <div className="space-y-2 p-4 mochi-card bg-white dark:bg-gray-900">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WalletCardSkeleton />
        <WalletCardSkeleton />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <BudgetBarSkeleton />
        <BudgetBarSkeleton />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <TransactionListSkeleton />
      </div>
    </div>
  );
}
