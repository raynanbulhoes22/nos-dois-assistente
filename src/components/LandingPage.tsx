import { HeroSection } from "./HeroSection";
import { PricingSection } from "./PricingSection";
import { LandingHeader } from "./LandingHeader";
import { LandingFooter } from "./LandingFooter";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <div className="pt-16"> {/* Compensate for fixed header */}
        <HeroSection />
        <PricingSection />
      </div>
      <LandingFooter />
    </div>
  );
};