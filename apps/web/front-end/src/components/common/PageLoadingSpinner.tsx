import type { FC } from 'react'
import { Loader2 } from 'lucide-react'

export const PageLoadingSpinner: FC = () => {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-100 border-t-emerald-600 animate-spin" />
          <Loader2 className="w-5 h-5 text-emerald-600 animate-pulse absolute" />
        </div>
        <p className="text-xs font-medium text-slate-500 tracking-wide animate-pulse">
          Memuat halaman...
        </p>
      </div>
    </div>
  )
}
