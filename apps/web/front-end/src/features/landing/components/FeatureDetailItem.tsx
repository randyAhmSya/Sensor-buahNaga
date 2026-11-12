import type { ElementType } from 'react'
import { Card } from '../../../components/ui/Card'
import { ScrollReveal } from './ScrollReveal'

export interface FeaturePoint {
  title: string
  desc: string
}

export interface FeatureDetailItemProps {
  badge: string
  icon: ElementType
  title: string
  description: string
  points: FeaturePoint[]
  isBgSlate?: boolean
}

export function FeatureDetailItem({
  badge,
  icon: Icon,
  title,
  description,
  points,
  isBgSlate = false,
}: FeatureDetailItemProps) {
  const containerClasses = isBgSlate
    ? 'bg-slate-50 border-y border-slate-200 py-16 sm:py-20 px-4 md:px-8'
    : 'bg-white py-16 sm:py-20 px-4 md:px-8'

  const cardClasses = isBgSlate
    ? 'rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-1.5'
    : 'rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-1.5'

  return (
    <section className={containerClasses}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Kolom Kiri: Ringkasan Editorial & 1 Ikon Utama */}
        <ScrollReveal
          direction="up"
          delay={100}
          className="lg:col-span-5 space-y-5"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {badge}
          </div>

          <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 mb-4">
            <Icon className="w-7 h-7" strokeWidth={2.25} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            {description}
          </p>
        </ScrollReveal>

        {/* Kolom Kanan: 3 Kartu Manfaat & Kapabilitas Operasional */}
        <ScrollReveal
          direction="up"
          delay={200}
          className="lg:col-span-7 grid grid-cols-1 gap-4"
        >
          {points.map((point) => (
            <Card key={point.title} className={cardClasses}>
              <h3 className="text-base font-semibold text-slate-900">
                {point.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {point.desc}
              </p>
            </Card>
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}
