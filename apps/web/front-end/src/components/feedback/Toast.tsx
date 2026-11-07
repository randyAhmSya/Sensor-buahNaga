import { useEffect } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'
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

  const visualStyles = {
    success: {
      card: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      iconBg: 'bg-emerald-600',
      title: 'text-emerald-950',
      desc: 'text-emerald-800',
    },
    error: {
      card: 'bg-rose-50 border-rose-300 text-rose-950',
      iconBg: 'bg-rose-600',
      title: 'text-rose-950',
      desc: 'text-rose-800',
    },
    warning: {
      card: 'bg-amber-50 border-amber-300 text-amber-950',
      iconBg: 'bg-amber-500',
      title: 'text-amber-950',
      desc: 'text-amber-800',
    },
    info: {
      card: 'bg-sky-50 border-sky-300 text-sky-950',
      iconBg: 'bg-sky-600',
      title: 'text-sky-950',
      desc: 'text-sky-800',
    },
  }

  const currentVisual = visualStyles[type]

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-white stroke-[2.5]" />
      case 'error':
        return <X className="w-4 h-4 text-white stroke-[2.5]" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-white stroke-[2.5]" />
      case 'info':
        return <Info className="w-4 h-4 text-white stroke-[2.5]" />
    }
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl transition-all duration-200 ease-out',
        currentVisual.card
      )}
      role={type === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs', currentVisual.iconBg)}>
        {renderIcon()}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className={cn('text-sm font-bold leading-tight truncate', currentVisual.title)}>{title}</h4>
        {message && <p className={cn('mt-0.5 text-xs leading-snug line-clamp-2', currentVisual.desc)}>{message}</p>}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
