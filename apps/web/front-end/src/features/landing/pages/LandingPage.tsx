import { HeroSection } from '../components/HeroSection'
import { FeatureGrid } from '../components/FeatureGrid'
import { HowItWorksSection } from '../components/HowItWorksSection'
import { ValuePropSection } from '../components/ValuePropSection'
import { PricingSection } from '../components/PricingSection'
import { CtaBanner } from '../components/CtaBanner'

export const LandingPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <HeroSection />
      <FeatureGrid />
      <HowItWorksSection />
      <ValuePropSection />
      <PricingSection />
      <CtaBanner />
    </div>
  )
}
