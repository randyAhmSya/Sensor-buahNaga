import { Lightbulb, Activity, Layers, Calendar } from 'lucide-react'
import { FeatureDetailItem } from '../components/FeatureDetailItem'
import { CtaBanner } from '../components/CtaBanner'
import { ScrollReveal } from '../components/ScrollReveal'

const featuresData = [
  {
    badge: 'PENCAHAYAAN PRESISI',
    icon: Lightbulb,
    title: 'Otomasi Jadwal & Auto-Dimming Lampu',
    description:
      'Sistem secara cerdas menyesuaikan intensitas cahaya lampu berdasarkan sensor lux lingkungan dan jadwal induksi pembungaan tanpa intervensi manual.',
    points: [
      {
        title: 'Efisiensi Daya Maksimal',
        desc: 'Mengurangi konsumsi listrik hingga 35 persen dengan menyalakan lampu hanya saat intensitas cahaya alami di bawah ambang batas.',
      },
      {
        title: 'Jadwal Terprogram Otomatis',
        desc: 'Penyalaan lampu malam hari berjalan tepat waktu sesuai fase vegetatif dan generatif yang ditentukan petani.',
      },
      {
        title: 'Kesehatan Tanaman Terjaga',
        desc: 'Menghindari stres cahaya berlebih pada sulur tanaman buah naga berkat pengaturan tingkat kecerahan yang stabil.',
      },
    ],
    isBgSlate: false,
  },
  {
    badge: 'TELEMETRI LINGKUNGAN',
    icon: Activity,
    title: 'Monitoring Telemetri Lux & Suhu Real-time',
    description:
      'Pengukuran kontinu terhadap intensitas cahaya alami dan temperatur mikroklimat di sekitar blok tanaman buah naga langsung ke dashboard Anda.',
    points: [
      {
        title: 'Sensor Presisi Lapangan',
        desc: 'Pembacaan intensitas lux dan suhu udara setiap menit dengan transmisi protokol MQTT berkecepatan tinggi.',
      },
      {
        title: 'Analisis Tren Harian',
        desc: 'Grafik fluktuasi suhu dan lux harian untuk mengevaluasi kondisi cuaca mikro yang mempengaruhi kecepatan pembungaan.',
      },
      {
        title: 'Deteksi Anomali Cepat',
        desc: 'Peringatan otomatis saat node sensor offline atau suhu lingkungan berada di luar rentang ideal.',
      },
    ],
    isBgSlate: true,
  },
  {
    badge: 'STRUKTUR LAHAN',
    icon: Layers,
    title: 'Manajemen Zona & Blok Kebun',
    description:
      'Organisasi tiang lampu dan tanaman berdasarkan blok kebun untuk kontrol penyinaran yang fleksibel sesuai kebutuhan pertumbuhan masing-masing zona.',
    points: [
      {
        title: 'Konfigurasi Spesifik Per Blok',
        desc: 'Atur jadwal nyala dan intensitas berbeda untuk blok fase vegetatif awal versus blok siap induksi bunga.',
      },
      {
        title: 'Identifikasi Cepat QR Tiang',
        desc: 'Setiap tiang sensor memiliki kode QR unik untuk verifikasi dan pengecekan cepat via ponsel saat inspeksi fisik.',
      },
      {
        title: 'Skalabilitas Multi-Hektar',
        desc: 'Menampung puluhan blok dan ratusan node sensor tanpa penurunan kinerja pemantauan sistem.',
      },
    ],
    isBgSlate: false,
  },
  {
    badge: 'PERENCANAAN PANEN',
    icon: Calendar,
    title: 'Analisis Siklus & Estimasi Panen',
    description:
      'Perhitungan perkiraan tanggal panen berbasis data historis penyinaran dan fase fisiologis tanaman untuk memudahkan perencanaan operasional.',
    points: [
      {
        title: 'Estimasi Tanggal Akurat',
        desc: 'Sistem memprediksi tanggal panen berdasarkan tanggal aktivasi lampu dan akumulasi hari induksi bunga.',
      },
      {
        title: 'Perencanaan Logistik & Tenaga Kerja',
        desc: 'Persiapkan kebutuhan pemetikan dan distribusi buah naga jauh hari sebelum masa panen tiba.',
      },
      {
        title: 'Evaluasi Efisiensi Musim',
        desc: 'Bandingkan data durasi penyinaran dan hasil tonase buah antar siklus tanam untuk peningkatan produktivitas.',
      },
    ],
    isBgSlate: true,
  },
]

export const FeaturesPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <ScrollReveal direction="up" delay={50}>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              FITUR UTAMA AGROLIGHT
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Semua Kebutuhan Kebun Buah Naga Modern
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Platform lengkap mulai dari otomasi pencahayaan cerdas, pemantauan telemetri real-time, hingga estimasi tanggal panen yang terukur.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Feature Details List */}
      <div>
        {featuresData.map((item) => (
          <FeatureDetailItem
            key={item.title}
            badge={item.badge}
            icon={item.icon}
            title={item.title}
            description={item.description}
            points={item.points}
            isBgSlate={item.isBgSlate}
          />
        ))}
      </div>

      {/* CTA Section */}
      <CtaBanner />
    </div>
  )
}
export default FeaturesPage
