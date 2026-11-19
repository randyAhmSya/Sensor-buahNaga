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
  showText,
}: BrandLogoProps) {
  const isLight = variant === 'light'
  // Pada latar terang (variant="dark"), default showText adalah false karena logo-240.webp sudah memuat tipografi AgroLight
  // Pada latar gelap (variant="light"), default showText adalah true agar teks putih tetap terbaca sampai logo-light.webp tersedia
  const shouldShowText = showText ?? isLight

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2.5 transition-colors select-none',
        className
      )}
      aria-label="AgroLight Home"
    >
      {isLight ? (
        <img
          src={logoImg}
          alt="AgroLight Logo"
          width={32}
          height={32}
          className={cn('w-8 h-8 object-contain shrink-0', imgClassName)}
        />
      ) : (
        <img
          src="/images/logo-240.webp"
          srcSet="/images/logo-240.webp 1x, /images/logo-480.webp 2x"
          alt="AgroLight"
          width={135}
          height={75}
          className={cn('h-8 w-auto max-w-[135px] object-contain shrink-0', imgClassName)}
        />
      )}
      {shouldShowText && (
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
