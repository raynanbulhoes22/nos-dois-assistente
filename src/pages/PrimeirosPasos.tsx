import { useState } from 'react';
import { OnboardingWizard } from '@/components/OnboardingWizard';

const PrimeirosPasos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 overscroll-contain">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 px-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Primeiros Passos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Vamos configurar seu perfil para uma experiência personalizada
            </p>
          </div>
          <OnboardingWizard />
        </div>
      </div>
    </div>
  );
};

export default PrimeirosPasos;