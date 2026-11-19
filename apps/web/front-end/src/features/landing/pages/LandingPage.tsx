import { HeroSection } from '../components/HeroSection'
import { FeatureGrid } from '../components/FeatureGrid'
import { HowItWorksSection } from '../components/HowItWorksSection'
import { CtaBanner } from '../components/CtaBanner'
import { usePageMeta } from '../hooks/usePageMeta'

export const LandingPage = () => {
  usePageMeta({
    title: 'AgroLight | Otomasi Pencahayaan Kebun Buah Naga',
    description:
      'Platform B2B SaaS IoT untuk otomasi pencahayaan LED induksi pembungaan dan estimasi panen presisi perkebunan buah naga.',
  })

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-slate-50">
      <HeroSection />
      <FeatureGrid />
      <HowItWorksSection />
      <CtaBanner />
    </div>
  )
}

