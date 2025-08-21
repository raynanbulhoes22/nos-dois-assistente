import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageCircle, Zap, TrendingUp, ArrowRight, CreditCard, DollarSign, Bell, Target, Send, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-accent/20"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <MessageCircle className="w-8 h-8 text-[#E63827] animate-float" />
      </div>
      <div className="absolute bottom-32 right-16 opacity-20">
        <TrendingUp className="w-6 h-6 text-[#E63827] animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute top-40 right-20 opacity-20">
        <Zap className="w-7 h-7 text-[#E63827] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-left">
            {/* Badge */}
            <Badge 
              variant="outline" 
              className="mb-6 border-[#E63827]/30 text-[#E63827] bg-[#E63827]/5 hover:bg-[#E63827]/10 px-4 py-2"
            >
              <Zap className="w-4 h-4 mr-2" />
              7 DIAS GRÁTIS
            </Badge>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Controle suas finanças pelo{" "}
              <span className="text-[#E63827] relative">
                WhatsApp
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-[#E63827]/20 -skew-x-12"></div>
              </span>
              {" "}com{" "}
              <span className="bg-gradient-to-r from-[#E63827] to-[#E63827]/80 bg-clip-text text-transparent">
                IA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Transforme sua gestão financeira com nossa plataforma inteligente. 
              Controle gastos, organize receitas e tome decisões mais inteligentes 
              através do WhatsApp. Experimente 7 dias grátis e veja a diferença.
            </p>


            {/* CTA Button */}
            <Button 
              size="xl"
              onClick={() => navigate("/auth")}
              className="bg-[#E63827] hover:bg-[#E63827]/90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group mb-4"
            >
              Testar 7 dias Grátis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              7 dias grátis • Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>

          {/* Right Column - Image with Floating Elements */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Phone Image */}
              <img 
                src="/lovable-uploads/92038e53-d2c7-4533-8f9d-dd1affbb9ee7.png"
                alt="WhatsApp conversation showing LucraAI managing financial transactions"
                className="max-w-md lg:max-w-lg xl:max-w-xl w-full h-auto relative z-10"
              />
              
              {/* Floating Financial Elements */}
              {/* Transaction Card - Top Left */}
              <Card className="absolute -top-4 -left-16 hidden lg:block w-48 p-3 bg-white/90 backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transação</span>
                  <Send className="w-4 h-4 text-[#E63827]" />
                </div>
                <div className="font-semibold text-lg">R$ 450,00</div>
                <div className="text-xs text-muted-foreground">Almoço - Restaurante</div>
              </Card>

              {/* Income Card - Top Right */}
              <Card className="absolute -top-8 -right-20 hidden lg:block w-44 p-3 bg-white/90 backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Receita</span>
                </div>
                <div className="font-semibold text-lg text-green-600">+R$ 3.200</div>
                <div className="text-xs text-muted-foreground">Este mês</div>
              </Card>

              {/* Credit Card - Middle Left */}
              <Card className="absolute top-20 -left-20 hidden lg:block w-40 p-3 bg-gradient-to-r from-[#E63827] to-[#E63827]/80 text-white shadow-lg animate-float z-20" style={{ animationDelay: '2s' }}>
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs opacity-80">****</span>
                </div>
                <div className="text-sm font-medium">Cartão Nubank</div>
                <div className="text-xs opacity-80">Limite: R$ 2.500</div>
              </Card>

              {/* WhatsApp Notification - Middle Right */}
              <Card className="absolute top-32 -right-16 hidden lg:block w-52 p-3 bg-green-500/90 text-white backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">WhatsApp Bot</span>
                </div>
                <div className="text-xs">💰 Gasto registrado: R$ 89,90 - Supermercado Extra</div>
              </Card>

              {/* Financial Goal - Bottom Left */}
              <Card className="absolute bottom-16 -left-12 hidden lg:block w-44 p-3 bg-white/90 backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '1.8s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Meta</span>
                </div>
                <div className="font-semibold">Emergência</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">75% de R$ 5.000</div>
              </Card>

              {/* Expense Alert - Bottom Right */}
              <Card className="absolute bottom-8 -right-24 hidden lg:block w-48 p-3 bg-orange-100 border border-orange-200 shadow-lg animate-float z-20" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-700">Alerta</span>
                </div>
                <div className="text-sm text-orange-800 font-medium">Gastos acima do orçado</div>
                <div className="text-xs text-orange-600">Categoria: Alimentação</div>
              </Card>

              {/* Monthly Summary - Far Right */}
              <Card className="absolute top-48 -right-8 hidden xl:block w-36 p-3 bg-white/90 backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '2.5s' }}>
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-4 h-4 text-[#E63827]" />
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-sm font-medium">Saldo</div>
                <div className="font-semibold text-lg">R$ 1.847</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};