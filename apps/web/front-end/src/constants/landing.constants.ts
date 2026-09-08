export interface NavLinkItem {
  label: string
  path: string
  footerLabel?: string
}

export interface PricingPlan {
  id: string
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  isPopular?: boolean
  popularBadge?: string
  buttonText: string
  buttonVariant: 'primary' | 'outline' | 'secondary'
  buttonLink?: string
  buttonHref?: string
}

export interface HowItWorksStep {
  step: number
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  imageOnRight: boolean
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Features', path: '/features', footerLabel: 'Fitur Utama' },
  { label: 'How it Works', path: '/how-it-works', footerLabel: 'Cara Kerja' },
  { label: 'Pricing', path: '/pricing', footerLabel: 'Paket Harga' },
  { label: 'About Us', path: '/about-us', footerLabel: 'Tentang Kami' },
]

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'trial',
    name: 'Trial',
    price: 'Gratis',
    description: '14 hari pertama uji coba sistem',
    features: [
      '1 kebun',
      'Hingga 3 blok',
      'Monitoring dasar (Lux & Suhu)',
      'Akses dashboard web & mobile',
    ],
    buttonText: 'Mulai Trial Gratis',
    buttonVariant: 'outline',
    buttonLink: '/login',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'Rp 499rb',
    period: '/ 30 hari',
    description: 'Tambah masa aktif fleksibel kapan saja',
    isPopular: true,
    popularBadge: 'PALING POPULER',
    features: [
      'Kebun tanpa batas',
      'Blok tanpa batas',
      'Auto-dimming cerdas penuh',
      'Estimasi panen berbasis AI',
      'Monitoring & pairing via QR code',
      'Riwayat data sensor 90 hari',
    ],
    buttonText: 'Pilih Paket Pro',
    buttonVariant: 'primary',
    buttonLink: '/login',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Hubungi Kami',
    description: 'Untuk perkebunan skala komersial besar',
    features: [
      'Semua fitur Pro disertakan',
      'Multi-user & role khusus per tenant',
      'Riwayat data telemetri unlimited',
      'Dukungan teknis prioritas 24/7',
      'Onboarding dibantu tim ahli lapangan',
    ],
    buttonText: 'Hubungi Sales',
    buttonVariant: 'outline',
    buttonHref: 'mailto:sales@agrolight.io?subject=Inquiry%20Enterprise%20AgroLight',
  },
]

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    title: 'Setup Kebun & Pasang Perangkat',
    description:
      'Tim AgroLight bantu daftarkan kebun dan blok, pasang gateway dan node sensor. QR unik per node.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCb0bYo5_f-KSGq7YpHj2ppcmsiHv_RgXGuXecLP9Epa3ilMQFvyyGV1RAxkFvALm5mZjT4rZ4NLPWzyK0ZXMLHjZb8svZD7E85HX9Hszx5qwfN3NYW5lIBo6XMQVlo69xKhqSKBQhwgWHqWJDz2XxoIz4lRqfg4pNxRLEChM_HIoKioNBZDpBok_fuwrK2JeXqtbgF4BCapT5fRD0fWVkbpuj6yNvunNzVrybt92zarGkjWwZfwFV3QA',
    imageAlt: 'Setup & Pemasangan',
    imageOnRight: true,
  },
  {
    step: 2,
    title: 'Scan QR untuk Pairing',
    description:
      'Petugas scan QR via mobile app untuk hubungkan node ke akun tanpa konfigurasi manual yang rumit.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSfc83kEN_xmWXeiuj1609J4C4f-DVNF4UZNk_p7CPLGowC-QaYU7CTXtYCBwX90JSfYMezfzw-_scTalDfOejBHPAIbUR_Wts-4SEScGXvnaEpoIE-wq9RqbWjg08pJx7v9idoYAsAMAmcf-D24whVxETsYhtgZeGvg4Ui0Xx7eodc_FAIkT6gcWbaSEMVQuULuz1YTzlal-pLjfnnGZqYFruAANrMnTLgHOADX1q6tI4RM3n9qLPRQ',
    imageAlt: 'Scan QR Pairing',
    imageOnRight: false,
  },
  {
    step: 3,
    title: 'Sistem Membaca Cahaya & Mengatur Lampu',
    description:
      'Auto-dimming menyesuaikan lampu berdasarkan cahaya alami secara real-time dan menjaga target lux harian.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwF2OdCIyUeagcGOqMI_ionAZp-TLLtx22pqXAa1d0sCCCcek8BW-G_BBAILQ1Pn0a_bqUeyRKrJV3BlEpzzOItwfIIJSj-MWekRCbqizYhJkMHOGXdC2LcJ4fCAn2lzzMN2ojQtoUSpBtifSsVn-Atu0PLa1vpGfOWQkIxiMiEZ39LbyVdu7s2Jc07mZlg7I6fzZC-JRDz_Y0lLALj5angylq9QCrVCW078cmr-XejjSE8h7SRNGY8g',
    imageAlt: 'Otomasi Cahaya',
    imageOnRight: true,
  },
  {
    step: 4,
    title: 'Pantau & Lihat Estimasi Panen',
    description:
      'Pantau status, energi, dan estimasi panen presisi berbasis akumulasi durasi penyinaran langsung di dasbor Anda.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAq-mu6Rp24npFSU-j4Q2oY4C4qvXxJ-DOCgWsK_Th_aSQRnzccoZ0_unF9l80sv--jW536sMiUv5kfC42d0DxjJkc65VRgIEuXRR3sOtFq4NqajSxkjMD-8MfKHmOt40fMbvDeh2FXkMROZeWVSQxUlGalezBytZDsc_Mhgx-qk4-fQ5W8sPlp7PF6lJGNWbH1aqCfrlNVF1XHVFPzFOf5Y7njxTN_rtbwc-L8u0xMKbOmnOuD-nDz8A',
    imageAlt: 'Dashboard Monitoring',
    imageOnRight: false,
  },
]
