import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const heroPerson = "/lovable-uploads/f0857788-1855-417d-94c7-7bad731d095c.png";

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {/* Geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/15 rounded-lg rotate-45"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-12rem)]">
          {/* Left Column - Text Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Controle suas
                <br />
                <span className="text-yellow-200">finanças</span> com
                <br />
                inteligência
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-lg">
                A plataforma completa para organizar suas entradas, saídas e 
                assinaturas com simplicidade e eficiência.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90" asChild>
                <Link to="/auth?mode=register">
                  Teste Grátis!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10" 
                asChild
              >
                <Link to="/auth?mode=login">
                  Entrar
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-12">
              <Card className="bg-white/15 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Registro</p>
                      <p className="text-white font-semibold">Financeiro</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/15 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Saldo</p>
                      <p className="text-white font-semibold">Mensal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Hero Image & Mobile Mockup */}
          <div className="relative">
            {/* Person Image */}
            <div className="relative">
              <img 
                src={heroPerson} 
                alt="Pessoa usando Lyvo" 
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
              
              {/* Floating Mobile Mockup */}
              <div className="absolute -right-4 top-8 bg-white rounded-2xl p-4 shadow-2xl w-48 animate-float">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">Saldo Atual</span>
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">R$ 2.847,50</div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                      <span className="text-xs text-gray-600">Receita</span>
                      <span className="text-sm font-medium text-green-600">+R$ 3.200</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                      <span className="text-xs text-gray-600">Gastos</span>
                      <span className="text-sm font-medium text-red-600">-R$ 352,50</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Another floating card */}
              <div className="absolute -left-6 bottom-12 bg-white rounded-xl p-3 shadow-xl animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Meta atingida!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};