import { HeroSection } from '../components/HeroSection'
import { FeatureGrid } from '../components/FeatureGrid'
import { HowItWorksSection } from '../components/HowItWorksSection'
import { CtaBanner } from '../components/CtaBanner'

export const LandingPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-slate-50">
      <HeroSection />
      <FeatureGrid />
      <HowItWorksSection />
      <CtaBanner />
    </div>
  )
}

