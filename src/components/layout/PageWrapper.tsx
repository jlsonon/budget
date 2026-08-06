import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function PageWrapper({ children, title, className = '' }: PageWrapperProps) {
  return (
    <div className={`max-w-md mx-auto w-full min-h-screen pb-20 md:pb-6 flex flex-col ${className}`}>
      {title && (
        <header className="px-6 py-4 flex-shrink-0 sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h1>
        </header>
      )}
      <main className="flex-1 px-4 sm:px-6 flex flex-col">
        {children}
      </main>
    </div>
  );
}
