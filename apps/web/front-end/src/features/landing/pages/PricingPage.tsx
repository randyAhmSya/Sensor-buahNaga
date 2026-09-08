import { PricingSection } from '../components/PricingSection'
import { CtaBanner } from '../components/CtaBanner'

export const PricingPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <PricingSection />
      <CtaBanner />
    </div>
  )
}
