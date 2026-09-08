import { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id?: string
  type?: ToastType
  title: string
  message?: string
  duration?: number
  onClose: () => void
  isVisible?: boolean
}

export function Toast({
  type = 'info',
  title,
  message,
  duration = 4000,
  onClose,
  isVisible = true,
}: ToastProps) {
  useEffect(() => {
    if (!duration || !isVisible) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, isVisible, onClose])

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
  }

  const borderStyles = {
    success: 'border-emerald-200 bg-white',
    warning: 'border-amber-200 bg-white',
    error: 'border-rose-200 bg-white',
    info: 'border-sky-200 bg-white',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all',
        'animate-in slide-in-from-top-2 fade-in duration-200',
        borderStyles[type]
      )}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {message && <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{message}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Tutup</span>
      </button>
    </div>
  )
}
