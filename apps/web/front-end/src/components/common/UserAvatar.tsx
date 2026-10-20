import { useState, type FC } from 'react'
import { User } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface UserAvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  textClassName?: string
  iconClassName?: string
  theme?: 'light' | 'dark'
  alt?: string
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

export const UserAvatar: FC<UserAvatarProps> = ({
  src,
  name,
  className,
  textClassName,
  iconClassName,
  theme = 'light',
  alt,
}) => {
  const [prevSrc, setPrevSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Reset state jika URL gambar berubah
  if (prevSrc !== src) {
    setPrevSrc(src)
    setHasError(false)
  }

  // Validasi URL: bersihkan string kosong, broken state, atau sisa URL dummy (unsplash / pravatar)
  const isDummyUrl = typeof src === 'string' && (src.includes('unsplash.com') || src.includes('pravatar'))
  const isValidSrc = Boolean(src && src.trim() !== '' && !hasError && !isDummyUrl)

  const initials = getInitials(name)

  const themeClasses =
    theme === 'dark'
      ? 'bg-slate-800 text-slate-200 border-slate-700'
      : 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden border flex items-center justify-center font-bold shrink-0 select-none',
        themeClasses,
        className
      )}
    >
      {isValidSrc ? (
        <img
          src={src as string}
          alt={alt || name || 'Foto Pengguna'}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span className={cn('text-xs font-bold leading-none', textClassName)}>{initials}</span>
      ) : (
        <User className={cn('w-4 h-4 text-slate-500 shrink-0', iconClassName)} strokeWidth={1.75} />
      )}
    </div>
  )
}

export default UserAvatar
