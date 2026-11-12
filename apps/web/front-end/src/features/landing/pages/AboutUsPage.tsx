import { Zap, Activity, ShieldCheck } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { ScrollReveal } from '../components/ScrollReveal'
import { CtaBanner } from '../components/CtaBanner'

export function AboutUsPage() {
  const coreValues = [
    {
      icon: Zap,
      title: 'Otomasi Penyinaran Terukur',
      description:
        'Sistem auto-dimming mengatur pencahayaan lampu secara cerdas berdasarkan bacaan sensor lux lingkungan dan fase fisiologis induksi bunga buah naga.',
    },
    {
      icon: Activity,
      title: 'Transparansi Data Telemetri',
      description:
        'Menyajikan catatan intensitas cahaya, suhu mikroklimat, dan estimasi beban energi secara jujur dan akurat langsung dari sensor lapangan.',
    },
    {
      icon: ShieldCheck,
      title: 'Kemudahan Operasional Lapangan',
      description:
        'Antarmuka praktis yang ramah petani dengan pairing instan kode QR pada tiang kebun dan arsitektur data yang tetap andal saat jaringan offline.',
    },
  ]

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <ScrollReveal direction="up" delay={50}>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              LATAR BELAKANG &amp; TUJUAN
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Kenapa Kami Membangun AgroLight
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Lahir dari tantangan nyata di perkebunan buah naga, di mana biaya listrik pencahayaan malam hari tinggi dan pengelolaan kebun masih mengandalkan perkiraan manual tanpa data telemetri.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Editorial Tantangan & Pendekatan (2 Kolom Kartu Tanpa Gambar) */}
      <SectionContainer className="py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          <ScrollReveal direction="up" delay={100}>
            <Card className="h-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                TANTANGAN LAPANGAN
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Pencahayaan Konvensional yang Tidak Terukur
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Penggunaan lampu sepanjang malam untuk merangsang pembungaan buah naga sering memicu lonjakan biaya listrik tanpa kepastian hasil panen. Tanpa kontrol berbasis intensitas cahaya alami dan suhu sekitar, energi terbuang dan jadwal pemetikan sulit diprediksi dengan tepat.
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={150}>
            <Card className="h-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                PENDEKATAN TEKNOLOGI
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Otomasi Berbasis Data Telemetri Riil
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                AgroLight hadir untuk menjembatani sensor perangkat keras lapangan dengan dashboard analitik cloud. Melalui sensor intensitas cahaya dan kontrol jadwal adaptif, penyinaran hanya aktif saat diperlukan, memangkas biaya daya listrik serta memberikan kepastian estimasi panen.
              </p>
            </Card>
          </ScrollReveal>
        </div>
      </SectionContainer>

      {/* Grid Fokus & Nilai Utama (3 Kolom Kartu) */}
      <section className="bg-white border-y border-slate-200 py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <ScrollReveal direction="up" delay={50}>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                PRINSIP PENGEMBANGAN
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Fokus dan Nilai Utama Sistem
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Tiga pilar fundamental yang memandu perancangan setiap fitur dan perangkat AgroLight.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {coreValues.map((val, idx) => {
              const Icon = val.icon
              return (
                <ScrollReveal key={val.title} direction="up" delay={100 + idx * 75}>
                  <Card className="h-full bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm mb-4">
                      <Icon className="w-7 h-7" strokeWidth={2.25} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      {val.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {val.description}
                    </p>
                  </Card>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <CtaBanner />
    </div>
  )
}
export default AboutUsPage
