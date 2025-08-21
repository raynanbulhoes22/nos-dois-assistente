import { Navigation } from "./Navigation";
import { HeroSection } from "./HeroSection";
import { WhyWhatsAppSection } from "./landing/WhyWhatsAppSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { PricingSection } from "./landing/PricingSection";
import { BenefitsSection } from "./landing/BenefitsSection";
import { FinalCTASection } from "./landing/FinalCTASection";
import { Footer } from "./landing/Footer";

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <WhyWhatsAppSection />
      <HowItWorksSection />
      <PricingSection />
      <BenefitsSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};