import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const heroPerson = "/lovable-uploads/f0857788-1855-417d-94c7-7bad731d095c.png";

export const HeroSection = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Free Trial Badge */}
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-lg px-6 py-2">
            🎉 7 DIAS GRÁTIS - Sem Compromisso!
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-16rem)]">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
                Gerencie suas
                <br />
                <span className="text-primary">finanças pelo</span>
                <br />
                WhatsApp
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Registre gastos, acompanhe orçamentos e receba insights financeiros 
                através do aplicativo que você já usa todos os dias.
              </p>

              <div className="flex items-center gap-2 text-gray-700">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-lg">Simples como enviar uma mensagem</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg font-semibold" 
                asChild
              >
                <Link to="/auth?mode=register" className="flex items-center gap-2">
                  Teste 7 Dias Grátis
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <div className="text-sm text-muted-foreground">
                ✅ Sem cartão • ✅ Sem compromisso • ✅ Cancele quando quiser
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image & WhatsApp Card */}
          <div className="relative flex items-center justify-center">
            {/* Main Hero Image */}
            <div className="relative">
              <img 
                src={heroPerson} 
                alt="Pessoa usando Lyvo pelo WhatsApp" 
                className="w-full max-w-lg mx-auto"
              />
            </div>

            {/* Floating WhatsApp Card */}
            <div className="absolute bottom-8 left-8 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 min-w-[280px]">
              <div className="space-y-4">
                {/* WhatsApp Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Lyvo</div>
                    <div className="text-xs text-green-500">online</div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-primary text-white px-3 py-2 rounded-2xl rounded-br-sm max-w-xs text-sm">
                      Gastei R$ 45 no almoço
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm max-w-xs text-sm">
                      ✅ Registrado!<br/>
                      💰 R$ 180 restantes no orçamento<br/>
                      📊 <span className="text-primary underline">Ver relatório</span>
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