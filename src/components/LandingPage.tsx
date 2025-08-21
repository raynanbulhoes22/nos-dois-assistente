import { HeroSection } from "./HeroSection";
import { PricingSection } from "./PricingSection";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PricingSection />
    </div>
  );
};