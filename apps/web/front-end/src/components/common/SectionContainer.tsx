import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  className?: string
  containerClassName?: string
  bg?: 'white' | 'slate-50' | 'transparent'
  as?: 'section' | 'div' | 'main'
}

export function SectionContainer({
  children,
  className,
  containerClassName,
  bg = 'white',
  as: Component = 'section',
  ...props
}: SectionContainerProps) {
  const bgStyles = {
    white: 'bg-white',
    'slate-50': 'bg-slate-50',
    transparent: 'bg-transparent',
  }

  return (
    <Component
      className={cn(bgStyles[bg], 'py-20', className)}
      {...props}
    >
      <div className={cn('max-w-7xl mx-auto px-6', containerClassName)}>
        {children}
      </div>
    </Component>
  )
}
