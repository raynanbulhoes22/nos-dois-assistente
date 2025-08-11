import { useState } from 'react';
import { OnboardingWizard } from '@/components/OnboardingWizard';

const PrimeirosPasos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 sm:from-background sm:via-background sm:to-secondary/20 overscroll-contain">
      {/* Mobile Header - App-like */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b sm:hidden">
        <div className="flex items-center justify-center h-16 px-4">
          <h1 className="text-lg font-semibold text-foreground">
            Configurar Conta
          </h1>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden sm:block container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 px-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Primeiros Passos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Vamos configurar seu perfil para uma experiência personalizada
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8 sm:container sm:mx-auto sm:px-3 sm:py-0">
        <div className="max-w-4xl mx-auto">
          <OnboardingWizard />
        </div>
      </div>
    </div>
  );
};

export default PrimeirosPasos;