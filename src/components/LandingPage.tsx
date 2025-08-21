import { Navigation } from "./Navigation";
import { HeroSection } from "./HeroSection";

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
    </div>
  );
};