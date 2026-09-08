import type { FC } from 'react'

export const DashboardSkeleton: FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 bg-slate-200 rounded-lg" />
          <div className="h-10 w-36 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* Alert Bar Skeleton */}
      <div className="flex flex-wrap gap-3">
        <div className="h-7 w-64 bg-slate-200 rounded-full" />
        <div className="h-7 w-80 bg-slate-200 rounded-full" />
      </div>

      {/* Grid Bento Skeleton (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-slate-100 rounded-xl" />
              {i === 3 && <div className="w-16 h-6 bg-slate-100 rounded-md" />}
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-slate-100 rounded" />
              <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-3 w-64 bg-slate-100 rounded" />
          </div>
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100/60 last:border-0">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-6 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
