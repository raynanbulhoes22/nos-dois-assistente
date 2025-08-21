import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageCircle, Zap, TrendingUp, ArrowRight, CreditCard, DollarSign, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background gradient using design system */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-primary/5"></div>
      
      {/* Subtle floating elements - reduced and better positioned */}
      <div className="absolute top-20 left-10 opacity-10" aria-hidden="true">
        <MessageCircle className="w-6 h-6 text-primary animate-float" />
      </div>
      <div className="absolute bottom-32 right-16 opacity-10" aria-hidden="true">
        <TrendingUp className="w-5 h-5 text-success animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="absolute top-40 right-20 opacity-10" aria-hidden="true">
        <Zap className="w-6 h-6 text-accent animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-6">
            {/* Badge - more prominent */}
            <Badge 
              variant="outline" 
              className="inline-flex items-center gap-2 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2 text-sm font-medium"
            >
              <Zap className="w-4 h-4" />
              7 DIAS GRÁTIS
            </Badge>

            {/* Main heading - improved typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Controle suas finanças pelo{" "}
              <span className="relative text-success">
                WhatsApp
                <div className="absolute -bottom-1 left-0 right-0 h-2 bg-success/20 -skew-x-12"></div>
              </span>
              {" "}com{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                IA
              </span>
            </h1>

            {/* Subtitle - simplified and more focused */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              IA que aprende seus padrões financeiros e te ajuda a tomar decisões inteligentes pelo WhatsApp.
            </p>

            {/* CTA Section - enhanced hierarchy */}
            <div className="space-y-4">
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Começar Agora - 7 Dias Grátis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                ✓ 7 dias grátis • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
              </p>
            </div>
          </div>

          {/* Right Column - Image with Strategic Floating Elements */}
          <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative max-w-sm lg:max-w-md xl:max-w-lg">
              {/* Main Phone Image */}
              <img 
                src="/lovable-uploads/92038e53-d2c7-4533-8f9d-dd1affbb9ee7.png"
                alt="WhatsApp interface showing LucraAI financial assistant managing transactions and budgets"
                className="w-full h-auto relative z-10 rounded-2xl shadow-2xl"
                loading="eager"
              />
              
              {/* Reduced, Strategic Floating Elements */}
              {/* WhatsApp Success Notification - Top */}
              <Card 
                className="absolute -top-6 -right-4 hidden lg:block w-56 p-3 bg-success/95 text-white backdrop-blur-sm shadow-xl animate-float z-30" 
                style={{ animationDelay: '1s' }}
                aria-hidden="true"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">LucraAI</span>
                </div>
                <div className="text-xs">✅ Transação categorizada automaticamente!</div>
              </Card>

              {/* Financial Goal Progress - Left */}
              <Card 
                className="absolute top-16 -left-8 hidden md:block w-44 p-3 bg-card/95 backdrop-blur-sm border shadow-lg animate-float z-30" 
                style={{ animationDelay: '2.5s' }}
                aria-hidden="true"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Meta</span>
                </div>
                <div className="font-medium text-sm">Emergência</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full w-3/4"></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">R$ 3.750 de R$ 5.000</div>
              </Card>

              {/* Credit Card Limit - Right */}
              <Card 
                className="absolute bottom-8 -right-8 hidden lg:block w-40 p-3 gradient-primary text-white shadow-lg animate-float z-30" 
                style={{ animationDelay: '4s' }}
                aria-hidden="true"
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs opacity-90">***6789</span>
                </div>
                <div className="text-sm font-medium">Nubank</div>
                <div className="text-xs opacity-90">Disponível: R$ 1.200</div>
              </Card>

              {/* Income Indicator - Bottom Left */}
              <Card 
                className="absolute bottom-0 -left-6 hidden md:block w-36 p-3 bg-card/95 backdrop-blur-sm border shadow-lg animate-float z-30" 
                style={{ animationDelay: '3s' }}
                aria-hidden="true"
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground">Receita</span>
                </div>
                <div className="font-semibold text-success">+R$ 2.150</div>
                <div className="text-xs text-muted-foreground">Esta semana</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};