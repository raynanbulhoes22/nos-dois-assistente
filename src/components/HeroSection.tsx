import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroImage = "/lovable-uploads/e298208e-285e-490a-b168-19394b13e80c.png";

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Background gradient - matches the reference */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary via-red-500 to-primary"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/90 via-red-400/80 to-orange-400/70"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column */}
          <div className="space-y-8 z-10">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-orange-50 border border-orange-200 rounded-full text-[#E63827] font-medium text-sm">
              ⚡ 7 DIAS GRÁTIS • SEM CARTÃO • SEM COMPROMISSO
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-gray-900">
                Suas finanças
                <br />
                pelo{" "}
                <span className="text-[#E63827]">WhatsApp</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Registre gastos, controle orçamentos e receba insights
                <br />
                em <strong className="text-gray-900">30 segundos</strong> pelo app que você já usa.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Sem apps extras</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">IA que entende você</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Relatórios automáticos</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">100% seguro</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="bg-[#E63827] hover:bg-[#d32f1f] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all" 
                asChild
              >
                <Link to="/auth?mode=register" className="flex items-center gap-2">
                  Começar Teste Grátis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <p className="text-gray-500 text-sm">
                ⏱️ Ative em 2 minutos • 🚫 Cancele quando quiser
              </p>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative lg:flex lg:justify-end">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Pessoa usando Lyvo pelo WhatsApp" 
                className="w-full max-w-lg mx-auto lg:mx-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};