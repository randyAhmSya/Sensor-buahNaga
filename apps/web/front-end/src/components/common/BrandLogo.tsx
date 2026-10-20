import { Link } from 'react-router-dom'
import logoImg from '@/assets/logo.png'
import { cn } from '../../utils/cn'

export interface BrandLogoProps {
  variant?: 'dark' | 'light'
  className?: string
  imgClassName?: string
  textClassName?: string
  textSize?: string
  to?: string
  showText?: boolean
}

export function BrandLogo({
  variant = 'dark',
  className,
  imgClassName,
  textClassName,
  textSize,
  to = '/',
  showText = true,
}: BrandLogoProps) {
  const isLight = variant === 'light'

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2.5 transition-colors select-none',
        className
      )}
      aria-label="AgroLight Home"
    >
      <img
        src={logoImg}
        alt="AgroLight Logo"
        className={cn('w-8 h-8 object-contain shrink-0', imgClassName)}
      />
      {showText && (
        <span
          className={cn(
            'font-extrabold text-xl tracking-tight leading-none',
            textSize,
            isLight ? 'text-white' : 'text-emerald-800 hover:text-emerald-900',
            textClassName
          )}
        >
          {isLight ? (
            <>
              Agro<span className="text-emerald-400">Light</span>
            </>
          ) : (
            'AgroLight'
          )}
        </span>
      )}
    </Link>
  )
}
