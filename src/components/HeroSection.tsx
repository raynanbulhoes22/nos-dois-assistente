import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageCircle, Zap, TrendingUp, ArrowRight, CreditCard, DollarSign, Bell, Target, Send, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-accent/20"></div>
      
      {/* Floating elements - Hidden on mobile */}
      <div className="absolute top-20 left-10 opacity-20 hidden lg:block">
        <MessageCircle className="w-8 h-8 text-primary animate-float" />
      </div>
      <div className="absolute bottom-32 right-16 opacity-20 hidden lg:block">
        <TrendingUp className="w-6 h-6 text-primary animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute top-40 right-20 opacity-20 hidden lg:block">
        <Zap className="w-7 h-7 text-primary animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content - Mobile First */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <Badge 
              variant="outline" 
              className="mb-4 md:mb-6 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 text-xs md:text-sm"
            >
              <Zap className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              7 DIAS GRÁTIS
            </Badge>

            {/* Main heading - Mobile First */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Controle suas finanças pelo{" "}
              <span className="text-primary relative">
                WhatsApp
                <div className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-2 md:h-3 bg-primary/20 -skew-x-12"></div>
              </span>
              {" "}com{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                IA
              </span>
            </h1>

            {/* Subtitle - Mobile First */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Transforme sua gestão financeira com nossa plataforma inteligente. 
              Controle gastos e tome decisões mais inteligentes através do WhatsApp.
            </p>


            {/* CTA Button - Mobile First */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-4 md:mb-6">
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 group w-full sm:w-auto"
              >
                Testar 7 dias Grátis
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground">
              7 dias grátis • Cancele quando quiser
            </p>
          </div>

          {/* Image - Mobile First */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
              {/* Main Phone Image - Optimized for Mobile */}
              <img 
                src="/lovable-uploads/92038e53-d2c7-4533-8f9d-dd1affbb9ee7.png"
                alt="WhatsApp conversation showing LucraAI managing financial transactions"
                className="w-full h-auto relative z-10 drop-shadow-2xl"
                loading="eager"
              />
              
              {/* Floating Financial Elements - Desktop Only */}
              {/* Transaction Card - Top Left */}
              <Card className="absolute -top-4 -left-16 hidden xl:block w-48 p-3 bg-card/90 backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transação</span>
                  <Send className="w-4 h-4 text-[#E63827]" />
                </div>
                <div className="font-semibold text-lg">R$ 450,00</div>
                <div className="text-xs text-muted-foreground">Almoço - Restaurante</div>
              </Card>

              {/* Income Card - Top Right */}
              <Card className="absolute -top-8 -right-20 hidden xl:block w-44 p-3 bg-card/90 backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Receita</span>
                </div>
                <div className="font-semibold text-lg text-success">+R$ 3.200</div>
                <div className="text-xs text-muted-foreground">Este mês</div>
              </Card>

              {/* Credit Card - Middle Left */}
              <Card className="absolute top-20 -left-20 hidden xl:block w-40 p-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg animate-float z-20" style={{ animationDelay: '2s' }}>
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs opacity-80">****</span>
                </div>
                <div className="text-sm font-medium">Cartão Nubank</div>
                <div className="text-xs opacity-80">Limite: R$ 2.500</div>
              </Card>

              {/* WhatsApp Notification - Middle Right */}
              <Card className="absolute top-32 -right-16 hidden xl:block w-52 p-3 bg-success/90 text-white backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">WhatsApp Bot</span>
                </div>
                <div className="text-xs">💰 Gasto registrado: R$ 89,90 - Supermercado Extra</div>
              </Card>

              {/* Financial Goal - Bottom Left */}
              <Card className="absolute bottom-16 -left-12 hidden xl:block w-44 p-3 bg-card/90 backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '1.8s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-info" />
                  <span className="text-sm text-muted-foreground">Meta</span>
                </div>
                <div className="font-semibold">Emergência</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-info h-2 rounded-full w-3/4"></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">75% de R$ 5.000</div>
              </Card>

              {/* Expense Alert - Bottom Right */}
              <Card className="absolute bottom-8 -right-24 hidden xl:block w-48 p-3 bg-warning/10 border border-warning/20 shadow-lg animate-float z-20" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-warning" />
                  <span className="text-sm text-warning">Alerta</span>
                </div>
                <div className="text-sm font-medium">Gastos acima do orçado</div>
                <div className="text-xs text-muted-foreground">Categoria: Alimentação</div>
              </Card>

              {/* Monthly Summary - Far Right */}
              <Card className="absolute top-48 -right-8 hidden xl:block w-36 p-3 bg-card/90 backdrop-blur-sm shadow-lg animate-float z-20" style={{ animationDelay: '2.5s' }}>
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