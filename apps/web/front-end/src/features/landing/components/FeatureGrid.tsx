import { Lightbulb, TrendingUp, QrCode, LayoutDashboard } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SectionContainer } from '../../../components/common/SectionContainer'

const features = [
  {
    icon: Lightbulb,
    title: 'Auto-Dimming Cerdas',
    description:
      'Sistem menyesuaikan intensitas cahaya secara otomatis berdasarkan fase pertumbuhan tanaman.',
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
      'Pindai QR code di setiap zona blok untuk mendapatkan data real-time seketika melalui smartphone.',
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
    <SectionContainer bg="slate-50" className="py-24 border-t border-slate-200" id="features">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          Fitur Unggulan AgroLight
        </h2>
        <p className="text-slate-600">
          Teknologi terintegrasi yang dirancang khusus untuk memaksimalkan hasil panen dan efisiensi energi kebun buah naga.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon
          return (
            <Card
              key={idx}
              className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                <IconComponent className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          )
        })}
      </div>
    </SectionContainer>
  )
}
