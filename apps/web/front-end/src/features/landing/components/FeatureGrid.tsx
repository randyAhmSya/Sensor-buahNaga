import { Link } from 'react-router-dom'
import { Lightbulb, TrendingUp, QrCode, LayoutDashboard, ArrowUpRight } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { ScrollReveal } from './ScrollReveal'

const features = [
  {
    icon: Lightbulb,
    title: 'Auto-Dimming Cerdas',
    description:
      'Sistem menyesuaikan intensitas cahaya secara otomatis berdasarkan fase pertumbuhan tanaman dan cuaca.',
  },
  {
    icon: TrendingUp,
    title: 'Estimasi Panen Akurat',
    description:
      'Prediksi hasil panen berbasis data historis dan durasi penyinaran untuk perencanaan bisnis yang lebih baik.',
  },
  {
    icon: QrCode,
    title: 'Monitoring via QR Code',
    description:
      'Pindai stiker QR pada tiang sensor di kebun untuk membaca data telemetri seketika lewat smartphone.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Real-time',
    description:
      'Pantau seluruh operasional kebun dari satu layar yang komprehensif, kapan saja, di mana saja.',
  },
]

export function FeatureGrid() {
  return (
    <SectionContainer className="py-20 md:py-24" id="features">
      <ScrollReveal direction="up" delay={50}>
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            TEKNOLOGI LAPANGAN TERUJI
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Fitur Unggulan AgroLight
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Teknologi terintegrasi yang dirancang khusus untuk memaksimalkan hasil panen dan efisiensi energi kebun buah naga.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon
          return (
            <ScrollReveal
              key={feature.title}
              direction="up"
              delay={100 + idx * 100}
              className="h-full"
            >
              <Card
                className="h-full bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-sm">
                    <IconComponent className="w-7 h-7" strokeWidth={2.25} />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-2.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </ScrollReveal>
          )
        })}
      </div>

      {/* Action Link to Full Features Page */}
      <div className="mt-12 text-center">
        <ScrollReveal direction="up" delay={200}>
          <Link
            to="/fitur"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm select-none"
          >
            <span>Lihat Detail Fitur</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" strokeWidth={2.25} />
          </Link>
        </ScrollReveal>
      </div>
    </SectionContainer>
  )
}

