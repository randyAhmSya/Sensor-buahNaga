import { Lightbulb, Calendar, QrCode, LayoutDashboard, Zap } from 'lucide-react'
import { FeatureDetailItem } from '../components/FeatureDetailItem'
import { CtaBanner } from '../components/CtaBanner'
import { SectionContainer } from '../../../components/common/SectionContainer'

const featuresData = [
  {
    badge: 'Pencahayaan Presisi',
    badgeIcon: Lightbulb,
    title: 'Auto-Dimming Cerdas',
    description:
      'Sistem kami menyesuaikan intensitas cahaya secara otomatis berdasarkan kondisi lingkungan dan suhu sekitar, memberikan pencahayaan optimal setiap saat tanpa intervensi manual.',
    points: [
      'Menghemat biaya listrik secara signifikan dengan penggunaan daya yang efisien.',
      'Menjaga siklus pembungaan tetap konsisten terlepas dari cuaca luar.',
      'Tidak perlu pemantauan manual di malam hari.',
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlMnYzmw56gXVdtkj6vmNQsD7Yt4pQu92HB9DUvN7m--GNZ0cpTBPcNAU7JMWnUMDDH8MERpv4NdhLkmEAPEf32t7UqHcJTEQPCP5nt6GNfMMx1laHsKjRuEunOo0ce8TnaEMhDLYytgx0DlRfqfFtNYjV5pK-Ic8ltZwvShlSD42TE46jJaL6viwoN8RzgdGgoePnPzFnxNwzaU0y1qZgJql4VZVoXpaEHohbW_KFpffhOR1z1Bm4Fg',
    imageAlt: 'Auto Dimming Preview',
    reverse: true,
    isBgSlate: false,
  },
  {
    badge: 'Prediksi Data',
    badgeIcon: Calendar,
    title: 'Estimasi Panen Akurat',
    description:
      'Sistem secara otomatis mencatat tanggal awal pencahayaan dan mengumpulkan data historis per blok untuk menghitung estimasi tanggal panen dengan tingkat akurasi tinggi.',
    points: [
      'Rencanakan kebutuhan tenaga kerja dan logistik jauh sebelum hari panen.',
      'Kurangi tebakan manual dan hindari risiko keterlambatan panen.',
      'Pantau status siklus pertumbuhan per blok secara visual.',
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBBxt72NeHrcz2mXSdSbMncIbCT0LZZyGuyVEQfmR5Y9lqvoJpC544hjjvocHMlTjV9qgODOYzxHbVxStG8YyuhKGS8nrlcvcxGGNOfE-6w5olqsFKbR20VUetzStQ5VSL2vDzfy26a6PR8jXRt0bH3n_JSLzZ8UCj6CYbwnSUW4MC4QBMRXchlC4m1qqc4RlPL-jcv6CTp7THUwumHNVaOeUmwOMX7FBQ5Ok_vtA1baodcMbMv80AMrQ',
    imageAlt: 'Estimasi Panen Table',
    reverse: false,
    isBgSlate: true,
  },
  {
    badge: 'Akses Lapangan',
    badgeIcon: QrCode,
    title: 'Monitoring via QR Code',
    description:
      'Setiap blok tanaman dilengkapi dengan QR code unik untuk pairing perangkat yang cepat dan akses instan ke data lapangan langsung dari ponsel Anda.',
    points: [
      'Pairing perangkat keras baru dalam hitungan detik.',
      'Akses riwayat lengkap blok tanaman secara instan saat berada di lapangan.',
      'Sangat mudah digunakan oleh tim lapangan dengan minim pelatihan.',
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAoZLnvEvQNJw3e__hqgRH2m8Z7kKHTyCRvgYRQ2pIpptm33ijmMqc-Z4XIkM2OY7cySm7k9xc_27TSFe_Gl9pXuVjKk9bLMM1SWji_IrlX4KKDx8JtRVBPGMoNzB9hMq6cyUadBd4RMumnvjB_qsLRS108cXe12DQCbzA_gpyEXX7KtlHg-Q7XdQoZ-JCtqpaf8G9GJXlwdLn_vfhqGcUIvef893yAKaXCkKAlQqdv2JL6M91ZOeMKWw',
    imageAlt: 'QR Code Scanning',
    reverse: true,
    isBgSlate: false,
    imageMaxWidthSm: true,
  },
  {
    badge: 'Pusat Kendali',
    badgeIcon: LayoutDashboard,
    title: 'Dashboard Real-time Multi-Kebun',
    description:
      'Pantau seluruh kebun, blok, dan status perangkat Anda dalam satu dashboard terpusat. Dapatkan visibilitas penuh atas operasional skala besar Anda.',
    points: [
      'Kelola banyak lokasi kebun hanya dengan satu akun utama.',
      'Status perangkat online/offline termonitor secara real-time.',
      'Dapat diakses kapan saja melalui antarmuka web maupun mobile.',
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBt1JVQ4JEeJRhhmiaoIpmawmjGUK261x-fvDS4laz4p_N9OpBuRHthF5ISOzcCFfW4EI3cy4glcH7qzBuo-YfNEWWOxxQvCQeCSztjkrsok9Zc7DDIMVFS44YXKnqmcVOJf8Qj8jky6INIdX0JYtENiB7_bkEjJV12hdHV9wxnBJfAJ3T8zDFPtwrZOXgqKKQYNhxXA-Jpi5o1pNlATsduZvUH-tYHuH14pyGsK1XRM8YT6VvYHABkUw',
    imageAlt: 'Dashboard Multi Farm',
    reverse: false,
    isBgSlate: true,
  },
  {
    badge: 'Efisiensi Daya',
    badgeIcon: Zap,
    title: 'Pemantauan Konsumsi Energi',
    description:
      'Sistem mencatat konsumsi daya (watt) secara detail per node kontrol, memungkinkan Anda mengevaluasi efisiensi dan menekan biaya operasional secara sistematis.',
    points: [
      'Bandingkan metrik konsumsi antar blok untuk mencari praktik terbaik.',
      'Deteksi lonjakan daya tidak wajar untuk pencegahan masalah awal.',
      'Evaluasi nyata penghematan biaya dari sistem auto-dimming.',
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDIh4RjWcpNqSzAJ1TLMAOa6NNwT0a3oQJhKt81AfcTjkNdxLqSjn08opywlDz3o6pTAXAci9PrTISJVroc1f6BRjvboANUviTFoAbEDff5dfUBd30S_Q_2V4MEGlzrwPkcUC9Y0ysMwiQs2vOx4CNg5eYM7z9XcCIfx72gfX6mQOlgl2SApwp-p_NLAMq1vi8maetfXW6Kajp94t3WQy8cEeH9RLjgv6jm_LfeGVlMQ4Y6XC4MI4K2cQ',
    imageAlt: 'Energy Monitoring Chart',
    reverse: true,
    isBgSlate: false,
  },
]

export const FeaturesPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Hero Section */}
      <SectionContainer
        className="py-20 md:py-24"
        containerClassName="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Semua yang Anda Butuhkan untuk Kebun Buah Naga yang Efisien
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Platform lengkap yang mengelola siklus pencahayaan cerdas hingga estimasi panen presisi, dirancang khusus untuk meningkatkan produktivitas agrikultur modern.
        </p>
      </SectionContainer>

      {/* Feature Details List */}
      <div className="space-y-4 border-t border-slate-100">
        {featuresData.map((item, idx) => (
          <FeatureDetailItem
            key={idx}
            badge={item.badge}
            badgeIcon={item.badgeIcon}
            title={item.title}
            description={item.description}
            points={item.points}
            imageUrl={item.imageUrl}
            imageAlt={item.imageAlt}
            reverse={item.reverse}
            isBgSlate={item.isBgSlate}
            imageMaxWidthSm={item.imageMaxWidthSm}
          />
        ))}
      </div>

      {/* CTA Section */}
      <CtaBanner />
    </div>
  )
}
