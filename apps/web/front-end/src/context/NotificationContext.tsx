import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type FC,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  description?: string
  duration: number
  remaining: number
  startedAt: number
  isPaused: boolean
}

export interface NotifyOptions {
  id?: string
  duration?: number
}

export interface NotifyContextValue {
  notify: {
    success: (title: string, description?: string, options?: NotifyOptions) => string
    error: (title: string, description?: string, options?: NotifyOptions) => string
    warning: (title: string, description?: string, options?: NotifyOptions) => string
    info: (title: string, description?: string, options?: NotifyOptions) => string
    dismiss: (id: string) => void
    dismissAll: () => void
  }
}

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 8000,
}

const NotificationContext = createContext<NotifyContextValue | null>(null)

export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearTimer = useCallback((id: string) => {
    const existing = timersRef.current.get(id)
    if (existing) {
      clearTimeout(existing)
      timersRef.current.delete(id)
    }
  }, [])

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id)
      setNotifications((prev) => prev.filter((item) => item.id !== id))
    },
    [clearTimer]
  )

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current.clear()
    setNotifications([])
  }, [])

  const scheduleDismiss = useCallback(
    (id: string, duration: number) => {
      clearTimer(id)
      const timer = setTimeout(() => {
        dismiss(id)
      }, duration)
      timersRef.current.set(id, timer)
    },
    [clearTimer, dismiss]
  )

  const pushNotification = useCallback(
    (type: NotificationType, title: string, description?: string, options?: NotifyOptions): string => {
      const duration = options?.duration ?? DEFAULT_DURATIONS[type]
      const targetId = options?.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

      setNotifications((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === targetId)
        const newItem: NotificationItem = {
          id: targetId,
          type,
          title,
          description,
          duration,
          remaining: duration,
          startedAt: Date.now(),
          isPaused: false,
        }

        if (existingIndex >= 0) {
          // Perbarui notifikasi yang sudah ada (misal cooldown slider)
          const updated = [...prev]
          updated[existingIndex] = newItem
          return updated
        }

        // Batasi maksimal 3 notifikasi bertumpuk (shift yang paling lama)
        const next = [...prev, newItem]
        if (next.length > 3) {
          const removed = next.shift()
          if (removed) clearTimer(removed.id)
        }
        return next
      })

      scheduleDismiss(targetId, duration)
      return targetId
    },
    [clearTimer, scheduleDismiss]
  )

  const handleMouseEnter = useCallback(
    (id: string) => {
      clearTimer(id)
      setNotifications((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          const elapsed = Date.now() - item.startedAt
          const remaining = Math.max(0, item.remaining - elapsed)
          return {
            ...item,
            remaining,
            isPaused: true,
          }
        })
      )
    },
    [clearTimer]
  )

  const handleMouseLeave = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          const remaining = item.remaining > 0 ? item.remaining : 1000
          scheduleDismiss(id, remaining)
          return {
            ...item,
            startedAt: Date.now(),
            isPaused: false,
          }
        })
      )
    },
    [scheduleDismiss]
  )

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t))
      timersRef.current.clear()
    }
  }, [])

  const notify = {
    success: useCallback(
      (title: string, description?: string, options?: NotifyOptions) =>
        pushNotification('success', title, description, options),
      [pushNotification]
    ),
    error: useCallback(
      (title: string, description?: string, options?: NotifyOptions) =>
        pushNotification('error', title, description, options),
      [pushNotification]
    ),
    warning: useCallback(
      (title: string, description?: string, options?: NotifyOptions) =>
        pushNotification('warning', title, description, options),
      [pushNotification]
    ),
    info: useCallback(
      (title: string, description?: string, options?: NotifyOptions) =>
        pushNotification('info', title, description, options),
      [pushNotification]
    ),
    dismiss,
    dismissAll,
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {notifications.map((item) => (
              <ToastItem
                key={item.id}
                item={item}
                onDismiss={() => dismiss(item.id)}
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={() => handleMouseLeave(item.id)}
              />
            ))}
          </div>,
          document.body
        )}
    </NotificationContext.Provider>
  )
}

interface ToastItemProps {
  item: NotificationItem
  onDismiss: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const ToastItem: FC<ToastItemProps> = ({ item, onDismiss, onMouseEnter, onMouseLeave }) => {
  const isError = item.type === 'error'

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

  const currentVisual = visualStyles[item.type]

  const renderIcon = () => {
    switch (item.type) {
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
      role={isError ? 'alert' : 'status'}
      aria-atomic="true"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`pointer-events-auto flex items-start gap-3 w-full rounded-2xl border p-4 shadow-xl transition-all duration-200 ease-out ${currentVisual.card}`}
    >
      {/* Ikon Status Lingkaran Padat dengan Simbol Putih */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${currentVisual.iconBg} shadow-xs`}>
        {renderIcon()}
      </div>

      {/* Konten Judul dan Deskripsi */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className={`text-sm font-bold leading-tight truncate ${currentVisual.title}`}>
          {item.title}
        </h4>
        {item.description && (
          <p className={`mt-0.5 text-xs leading-snug line-clamp-2 ${currentVisual.desc}`}>
            {item.description}
          </p>
        )}
      </div>

      {/* Tombol Tutup Silang dengan Warna Hover Solid (Tanpa Opacity) */}
      <button
        type="button"
        onClick={onDismiss}
        className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useNotify(): NotifyContextValue['notify'] {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotify must be used within a NotificationProvider')
  }
  return context.notify
}

