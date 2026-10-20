import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { PRICING_PLANS, type PricingPlan } from '../../../constants/landing.constants'

export interface PricingSectionProps {
  id?: string
  title?: string
  description?: string
}

export function PricingSection({
  id = 'pricing',
  title = 'Paket Harga yang Fleksibel',
  description = 'Langganan dihitung berdasarkan masa aktif (hari), bukan biaya bulanan otomatis, bayar sesuai durasi yang dibutuhkan.',
}: PricingSectionProps) {
  return (
    <SectionContainer id={id} className="py-20 md:py-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {PRICING_PLANS.map((plan: PricingPlan) => {
            const isPopular = Boolean(plan.isPopular)

            return (
              <Card
                key={plan.id}
                className={
                  isPopular
                    ? 'bg-white rounded-2xl p-8 border-2 border-emerald-600 shadow-xl relative md:-translate-y-3 flex flex-col justify-between h-full'
                    : 'bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between h-full'
                }
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {plan.popularBadge || 'PALING POPULER'}
                  </div>
                )}

                <div>
                  <h3
                    className={
                      isPopular
                        ? 'text-xl font-bold text-emerald-800 mb-2 mt-1'
                        : 'text-xl font-bold text-slate-900 mb-2'
                    }
                  >
                    {plan.name}
                  </h3>

                  {plan.period ? (
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold text-slate-900">
                        {plan.price}
                      </span>
                      <span className="text-sm text-slate-500">{plan.period}</span>
                    </div>
                  ) : (
                    <div
                      className={
                        plan.id === 'enterprise'
                          ? 'text-3xl font-bold text-slate-900 mb-2'
                          : 'text-4xl font-bold text-slate-900 mb-2'
                      }
                    >
                      {plan.price}
                    </div>
                  )}

                  <p className="text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
                    {plan.description}
                  </p>

                  <ul className="space-y-3.5 mb-8 text-sm text-slate-700">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.buttonHref ? (
                  <a href={plan.buttonHref} className="w-full block">
                    <Button
                      variant={plan.buttonVariant}
                      size="lg"
                      className="w-full border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 rounded-xl"
                    >
                      {plan.buttonText}
                    </Button>
                  </a>
                ) : (
                  <Link to={plan.buttonLink || '/login'} className="w-full">
                    <Button
                      variant={plan.buttonVariant}
                      size="lg"
                      className={
                        isPopular
                          ? 'w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-md'
                          : 'w-full border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-50 rounded-xl'
                      }
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                )}
              </Card>
            )
          })}
        </div>

        {/* Catatan Skema Pembayaran */}
        <p className="text-center text-xs text-slate-500 mt-10 max-w-2xl mx-auto leading-relaxed">
          Harga dihitung berdasarkan penambahan masa aktif (hari), bukan langganan otomatis berulang. Anda hanya membayar saat melakukan perpanjangan paket.
        </p>
      </div>
    </SectionContainer>
  )
}
