import React, { useState, useEffect, useRef, type ReactNode } from 'react';

export interface LazyVisibleChartProps {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: string;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export const LazyVisibleChart: React.FC<LazyVisibleChartProps> = ({
  children,
  fallback,
  minHeight = 'min-h-[260px]',
  rootMargin = '120px',
  threshold = 0.05,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Jika sudah visible, tidak perlu observer lagi
    if (isVisible) return;

    const element = containerRef.current;
    if (!element) return;

    // Fallback jika IntersectionObserver tidak tersedia di lingkungan browser lama
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && (entry.isIntersecting || entry.intersectionRatio > 0)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin, threshold]);

  const defaultSkeleton = (
    <div
      className={`w-full ${minHeight} bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between animate-pulse shadow-2xs`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="space-y-1.5 w-1/3">
          <div className="h-4 bg-slate-200 rounded-md w-3/4" />
          <div className="h-3 bg-slate-100 rounded-md w-1/2" />
        </div>
        <div className="h-7 w-24 bg-slate-100 rounded-lg" />
      </div>
      <div className="flex-1 flex items-end gap-3 pt-6 pb-2">
        <div className="w-full h-3/4 bg-slate-100 rounded-lg" />
        <div className="w-full h-1/2 bg-slate-100 rounded-lg" />
        <div className="w-full h-4/5 bg-slate-100 rounded-lg" />
        <div className="w-full h-2/3 bg-slate-100 rounded-lg" />
        <div className="w-full h-full bg-slate-100 rounded-lg" />
      </div>
      <div className="flex justify-between pt-2">
        <div className="h-3 bg-slate-100 rounded w-16" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`w-full ${minHeight} ${className}`}>
      {isVisible ? children : (fallback || defaultSkeleton)}
    </div>
  );
};

export default LazyVisibleChart;

