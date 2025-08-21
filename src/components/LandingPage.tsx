import { HeroSection } from "./HeroSection";
import { WhyChooseSection } from "./WhyChooseSection";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WhyChooseSection />
    </div>
  );
};