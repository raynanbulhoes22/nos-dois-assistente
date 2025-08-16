import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BarChart3, Wallet, Target, Calendar, X, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import modalBg from "@/assets/modal-bg.jpg";

// WhatsApp SVG Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.484 3.488"/>
  </svg>
);
interface User {
  id: string;
  email?: string;
}
interface WelcomeModalProps {
  user: User;
}
export const WelcomeModal = ({
  user
}: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const whatsappNumber = "5569993140550";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Acabei de me cadastrar no LucraAI e quero começar a enviar meus registros financeiros para análise inteligente!`;
  
  const features = [{
    icon: Sparkles,
    title: "IA Financeira",
    description: "Análise inteligente dos seus gastos"
  }, {
    icon: TrendingUp,
    title: "Insights Personalizados",
    description: "Recomendações sob medida"
  }, {
    icon: Shield,
    title: "100% Seguro",
    description: "Seus dados protegidos"
  }, {
    icon: Zap,
    title: "Resultados Rápidos",
    description: "Análises em tempo real"
  }];
  useEffect(() => {
    if (user?.email) {
      const hasSeenWelcome = localStorage.getItem(`dashboard_welcome_shown_${user.email}`);
      const dontShow = localStorage.getItem(`dashboard_welcome_dont_show_${user.email}`);
      if (!hasSeenWelcome && !dontShow) {
        setIsOpen(true);
      }
    }
  }, [user?.email]);
  const handleClose = () => {
    if (user?.email) {
      localStorage.setItem(`dashboard_welcome_shown_${user.email}`, 'true');
      if (dontShowAgain) {
        localStorage.setItem(`dashboard_welcome_dont_show_${user.email}`, 'true');
      }
    }
    setIsOpen(false);
  };
  if (!isOpen) return null;
  
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-[90vw] max-h-[85vh] p-0 gap-0 border-0 bg-transparent overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-lg"
          style={{ backgroundImage: `url(${modalBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-slate-900/75 to-blue-800/85 backdrop-blur-[1px] rounded-lg" />
        </div>

        {/* Close Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute right-4 top-4 z-20 h-10 w-10 p-0 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white" 
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </Button>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col p-6 space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            
            {/* Hero Text */}
            <div className="space-y-3 animate-fade-in">
              <h1 className="text-xl font-bold text-white leading-tight">
                Transforme seus Dados
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  em Inteligência
                </span>
              </h1>
              <p className="text-sm text-white/90">
                IA que analisa seus gastos via WhatsApp
              </p>
            </div>

            {/* WhatsApp Card */}
            <Card className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl animate-scale-in">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3">
                      <WhatsAppIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-center">
                    <h2 className="text-lg font-bold text-white">
                      Consultor Financeiro
                    </h2>
                    <p className="text-sm text-white/90">
                      Comece enviando seus registros
                    </p>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <p className="text-xs text-white/90 font-medium mb-1">WhatsApp Oficial</p>
                    <p className="text-sm font-bold text-white">
                      +55 (69) 9.9314-0550
                    </p>
                  </div>

                  <Button 
                    onClick={() => window.open(whatsappLink, '_blank')} 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 h-auto text-sm" 
                  >
                    <WhatsAppIcon className="h-4 w-4 mr-2" />
                    Iniciar Análise
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 group">
                  <CardContent className="p-3">
                    <div className="text-center space-y-1">
                      <div className="flex justify-center">
                        <feature.icon className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-xs">
                          {feature.title}
                        </h4>
                        <p className="text-[10px] text-white/70">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Don't Show Again Checkbox */}
            <div className="flex items-center justify-center space-x-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <Checkbox 
                id="dont-show-again"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/50"
              />
              <Label 
                htmlFor="dont-show-again" 
                className="text-xs text-white/80 cursor-pointer"
              >
                Não mostrar novamente
              </Label>
            </div>

            {/* Secondary CTA */}
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button 
                onClick={handleClose} 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20 text-xs py-2"
              >
                Explorar Depois
              </Button>
              <p className="text-[10px] text-white/60 mt-2">
                Acesse o WhatsApp pelo menu
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};