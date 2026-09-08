import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  count?: number
}

export function SkeletonLoader({
  variant = 'rectangular',
  className,
  width,
  height,
  count = 1,
  style,
  ...props
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  const baseClasses = 'animate-pulse bg-slate-200/80'

  return (
    <>
      {items.map((key) => (
        <div
          key={key}
          className={cn(baseClasses, variantStyles[variant], className)}
          style={{
            width,
            height,
            ...style,
          }}
          {...props}
        />
      ))}
    </>
  )
}
