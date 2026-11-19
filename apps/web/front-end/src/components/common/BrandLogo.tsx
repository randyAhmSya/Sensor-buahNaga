import { Link } from 'react-router-dom'
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
  showText = false,
}: BrandLogoProps) {
  const isLight = variant === 'light'
  const logoSrc = isLight ? '/images/logo-light-200.webp' : '/images/logo-200.webp'
  const logoSrcSet = isLight
    ? '/images/logo-light-200.webp 1x, /images/logo-light-400.webp 2x'
    : '/images/logo-200.webp 1x, /images/logo-400.webp 2x'

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center transition-colors select-none',
        className
      )}
      aria-label="AgroLight Beranda"
    >
      <img
        src={logoSrc}
        srcSet={logoSrcSet}
        alt="AgroLight"
        width={200}
        height={85}
        className={cn('h-11 w-auto max-w-[150px] object-contain shrink-0', imgClassName)}
      />
      {showText && (
        <span
          className={cn(
            'font-extrabold text-xl tracking-tight leading-none ml-2.5',
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
