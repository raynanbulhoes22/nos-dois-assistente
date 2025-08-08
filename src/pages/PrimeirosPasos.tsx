import { useState } from 'react';
import { OnboardingWizard } from '@/components/OnboardingWizard';

const PrimeirosPasos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Primeiros Passos
            </h1>
            <p className="text-muted-foreground">
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