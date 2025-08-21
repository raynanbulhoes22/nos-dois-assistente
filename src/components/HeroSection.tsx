import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroPerson = "/lovable-uploads/f0857788-1855-417d-94c7-7bad731d095c.png";

export const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-red-50 overflow-hidden pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-12rem)]">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900">
                Controle suas
                <br />
                <span className="text-orange-600">finanças</span> com
                <br />
                inteligência
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg">
                A plataforma completa para organizar suas entradas, saídas e 
                assinaturas com simplicidade e eficiência.
              </p>
            </div>

            <div className="flex items-center">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg" 
                asChild
              >
                <Link to="/auth?mode=register" className="flex items-center gap-2">
                  Teste Grátis!
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Hero Image & Financial Card */}
          <div className="relative flex items-center justify-center">
            {/* Main Hero Image */}
            <div className="relative">
              <img 
                src={heroPerson} 
                alt="Pessoa usando Lyvo" 
                className="w-full max-w-lg mx-auto"
              />
            </div>

            {/* Floating Financial Card - positioned like in Figma */}
            <div className="absolute bottom-8 left-8 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 min-w-[280px]">
              <div className="space-y-4">
                {/* Meta atingida indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Meta atingida!</span>
                  <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500"></div>
                  </div>
                </div>
                
                {/* Saldo Atual */}
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">R$ 2.847,50</div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">Receita</span>
                      <span className="text-sm font-semibold text-green-600">+R$ 3.200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 bg-red-50 px-3 py-1 rounded-full">Gastos</span>
                      <span className="text-sm font-semibold text-red-600">-R$ 352,50</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};