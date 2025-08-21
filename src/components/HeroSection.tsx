import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Zap, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
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
              Gestão Financeira Inteligente
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
              através do WhatsApp.
            </p>

            {/* Benefits list */}
            <div className="grid gap-4 mb-10">
              <div className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-full bg-[#E63827]/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#E63827]" />
                </div>
                <span>Via WhatsApp</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-full bg-[#E63827]/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#E63827]" />
                </div>
                <span>Powered by IA</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-full bg-[#E63827]/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#E63827]" />
                </div>
                <span>Insights Inteligentes</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              size="xl"
              onClick={() => navigate("/auth")}
              className="bg-[#E63827] hover:bg-[#E63827]/90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group mb-4"
            >
              Começar Grátis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Sem cartão de crédito • Setup em 2 minutos • Grátis para sempre
            </p>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src="/lovable-uploads/6a305627-906c-42af-ba49-ed8f5520bbfd.png"
                alt="WhatsApp conversation showing LucraAI managing financial transactions"
                className="max-w-sm lg:max-w-md xl:max-w-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};