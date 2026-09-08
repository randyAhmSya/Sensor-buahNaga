import type { ElementType } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'

export interface FeatureDetailItemProps {
  badge: string
  badgeIcon?: ElementType
  title: string
  description: string
  points: string[]
  imageUrl: string
  imageAlt: string
  reverse?: boolean
  isBgSlate?: boolean
  imageMaxWidthSm?: boolean
}

export function FeatureDetailItem({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  points,
  imageUrl,
  imageAlt,
  reverse = false,
  isBgSlate = false,
  imageMaxWidthSm = false,
}: FeatureDetailItemProps) {
  const containerClasses = isBgSlate
    ? 'py-16 px-6 md:px-12 max-w-7xl mx-auto bg-slate-50 rounded-3xl my-8 border border-slate-200/60'
    : 'py-16 px-6 max-w-7xl mx-auto'

  return (
    <section className={containerClasses}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Image column */}
        <Card
          className={cn(
            reverse ? 'order-2 md:order-1' : 'order-2 md:order-2',
            'rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-white p-2 flex items-center justify-center'
          )}
        >
          <img
            className={`w-full h-auto rounded-xl object-cover ${
              imageMaxWidthSm ? 'max-w-sm mx-auto' : ''
            }`}
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
          />
        </Card>

        {/* Text column */}
        <div className={`${reverse ? 'order-1 md:order-2' : 'order-1 md:order-1'} space-y-4`}>
          <div className="border border-emerald-600 bg-transparent text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{badge}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>

          <p className="text-slate-600 leading-relaxed text-base">
            {description}
          </p>

          <ul className="space-y-3 pt-2">
            {points.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-700 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
