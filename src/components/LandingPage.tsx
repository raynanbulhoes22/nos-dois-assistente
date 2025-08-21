import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { SocialProofSection } from "./SocialProofSection";
import { PricingSection } from "./PricingSection";
import { FAQSection } from "./FAQSection";
import { LandingHeader } from "./LandingHeader";
import { LandingFooter } from "./LandingFooter";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <div className="pt-16"> {/* Compensate for fixed header */}
        <HeroSection />
        <FeaturesSection />
        <SocialProofSection />
        <PricingSection />
        <FAQSection />
      </div>
      <LandingFooter />
    </div>
  );
};