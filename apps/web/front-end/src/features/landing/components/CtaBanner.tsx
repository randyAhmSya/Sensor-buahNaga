import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ScrollReveal } from './ScrollReveal'

export interface CtaBannerProps {
  title?: string
  description?: string
  buttonText?: string
  onCtaClick?: () => void
}

export function CtaBanner({
  title = 'Mulai Kelola Kebun Buah Naga Anda Lebih Efisien',
  description = 'Bergabunglah dengan pengelola kebun modern lainnya yang telah mengoptimalkan hasil panen mereka bersama sistem automasi AgroLight.',
  buttonText = 'Mulai Sekarang',
  onCtaClick,
}: CtaBannerProps) {
  const buttonElement = (
    <Button
      variant="white"
      size="lg"
      onClick={onCtaClick}
      className="rounded-xl px-8 py-3.5 text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition-all shadow-md inline-flex items-center gap-2"
    >
      <span>{buttonText}</span>
      <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2.25} />
    </Button>
  )

  return (
    <section className="w-full bg-white py-12 px-4 md:px-8">
      <ScrollReveal direction="up" delay={50}>
        <div className="max-w-7xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 md:p-14 text-center text-white shadow-xl">
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {title}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>

            <div className="pt-2">
              {onCtaClick ? (
                buttonElement
              ) : (
                <Link to="/register" className="inline-block">
                  {buttonElement}
                </Link>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

