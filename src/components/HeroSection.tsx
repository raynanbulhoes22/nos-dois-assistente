import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroPerson = "/lovable-uploads/f0857788-1855-417d-94c7-7bad731d095c.png";

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50/30"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm">
              <Zap className="w-4 h-4 mr-2" />
              7 DIAS GRÁTIS • SEM CARTÃO • SEM COMPROMISSO
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-none text-gray-900">
                Suas finanças
                <br />
                pelo{" "}
                <span className="text-primary relative">
                  WhatsApp
                  <div className="absolute -bottom-2 left-0 w-full h-4 bg-primary/20 -skew-x-12"></div>
                </span>
              </h1>
              
              <p className="text-2xl text-gray-600 font-light max-w-xl leading-relaxed">
                Registre gastos, controle orçamentos e receba insights em{" "}
                <strong className="text-gray-900">30 segundos</strong> pelo app que você já usa.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                asChild
              >
                <Link to="/auth?mode=register" className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6" />
                  Começar Teste Grátis
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
              
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Ative em 2 minutos • Cancele quando quiser</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative z-10">
              <img 
                src={heroPerson} 
                alt="Pessoa gerenciando finanças pelo WhatsApp" 
                className="w-full max-w-md mx-auto drop-shadow-2xl"
              />
            </div>

            {/* Floating WhatsApp Preview */}
            <div className="absolute -bottom-8 -left-8 z-20 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 max-w-xs">
              {/* WhatsApp Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Lyvo</div>
                  <div className="text-xs text-green-500 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    online agora
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-primary text-white px-4 py-2 rounded-2xl rounded-br-sm text-sm font-medium">
                    Comprei um café por R$ 8,50
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-50 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">Registrado!</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Categoria: Alimentação<br/>
                      Orçamento mensal: R$ 142 restantes
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -top-4 -right-4 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900">30s</div>
                <div className="text-xs text-gray-600">tempo médio</div>
                <div className="text-xs text-gray-600">para registrar</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};