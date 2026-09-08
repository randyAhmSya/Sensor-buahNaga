import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'

export interface CtaBannerProps {
  title?: string
  description?: string
  buttonText?: string
  onCtaClick?: () => void
}

export function CtaBanner({
  title = 'Mulai Kelola Kebun Buah Naga Anda Lebih Efisien',
  description = 'Bergabunglah dengan pengelola kebun modern lainnya yang telah mengoptimalkan hasil panen mereka bersama AgroLight.',
  buttonText = 'Coba Gratis Sekarang',
  onCtaClick,
}: CtaBannerProps) {
  const buttonElement = (
    <Button
      variant="white"
      size="lg"
      onClick={onCtaClick}
      className="rounded-xl px-8 py-3.5 text-emerald-900 font-bold hover:bg-emerald-50 transition-colors shadow-sm"
    >
      {buttonText}
    </Button>
  )

  return (
    <section className="w-full bg-emerald-800 text-white py-20 px-6 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {title}
        </h2>

        <p className="text-emerald-100 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>

        <div>
          {onCtaClick ? (
            buttonElement
          ) : (
            <Link to="/register" className="inline-block">
              {buttonElement}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
