import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  Wallet, 
  Target, 
  Calendar,
  MessageCircle,
  X
} from "lucide-react";

interface User {
  id: string;
  email?: string;
}

interface WelcomeModalProps {
  user: User;
}

export const WelcomeModal = ({ user }: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "5569993140550";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Acabei de me cadastrar no LucraAI e quero começar a enviar meus registros financeiros para análise.`;

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Completo",
      description: "Visualize suas finanças analisadas"
    },
    {
      icon: Wallet,
      title: "Controle de Gastos",
      description: "Organize por categorias"
    },
    {
      icon: Target,
      title: "Metas Financeiras",
      description: "Acompanhe seu progresso"
    },
    {
      icon: Calendar,
      title: "Planejamento",
      description: "Antecipe compromissos"
    }
  ];

  useEffect(() => {
    if (user?.email) {
      const hasSeenWelcome = localStorage.getItem(`dashboard_welcome_shown_${user.email}`);
      if (!hasSeenWelcome) {
        setIsOpen(true);
      }
    }
  }, [user?.email]);

  const handleClose = () => {
    if (user?.email) {
      localStorage.setItem(`dashboard_welcome_shown_${user.email}`, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-gray-100"
          onClick={handleClose}
        >
          <X className="h-4 w-4 text-gray-600" />
          <span className="sr-only">Fechar</span>
        </Button>

        {/* WhatsApp Hero Section - 70% of space */}
        <div className="bg-white border-b border-gray-100 p-8 md:p-12">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Seu Consultor Financeiro Pessoal
              </DialogTitle>
              <p className="text-lg text-gray-600 leading-relaxed">
                Envie seus gastos via WhatsApp e receba análises personalizadas da nossa equipe de especialistas
              </p>
            </DialogHeader>

            {/* WhatsApp Contact Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 rounded-full p-3">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Comece enviando seus primeiros registros
                  </h3>
                  <p className="text-gray-600">
                    Nossa equipe vai analisar e retornar insights personalizados para você
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">WhatsApp Oficial</p>
                  <p className="text-lg font-semibold text-gray-900">
                    +55 (69) 9.9314-0550
                  </p>
                </div>

                <Button
                  onClick={() => window.open(whatsappLink, '_blank')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 h-auto text-base"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Enviar Primeiro Registro
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - 30% of space */}
        <div className="bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recursos da Plataforma
              </h3>
              <p className="text-sm text-gray-600">
                Enquanto isso, explore o que temos disponível
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-50 rounded-lg p-2 flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Secondary CTA */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Explorar Plataforma Depois
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Você sempre pode acessar o WhatsApp através do menu
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};