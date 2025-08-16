import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Wallet, Target, Calendar, X } from "lucide-react";

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
  const whatsappNumber = "5569993140550";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Acabei de me cadastrar no LucraAI e quero começar a enviar meus registros financeiros para análise.`;
  const features = [{
    icon: BarChart3,
    title: "Dashboard Completo",
    description: "Visualize suas finanças analisadas"
  }, {
    icon: Wallet,
    title: "Controle de Gastos",
    description: "Organize por categorias"
  }, {
    icon: Target,
    title: "Metas Financeiras",
    description: "Acompanhe seu progresso"
  }, {
    icon: Calendar,
    title: "Planejamento",
    description: "Antecipe compromissos"
  }];
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
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
        {/* Custom Close Button */}
        <Button variant="ghost" size="sm" className="absolute right-4 top-4 z-10 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-gray-100" onClick={handleClose}>
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
              
            </DialogHeader>

            {/* WhatsApp Contact Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 rounded-full p-3">
                  <WhatsAppIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Comece enviando seus primeiros registros
                  </h3>
                  
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">WhatsApp Oficial</p>
                  <p className="text-lg font-semibold text-gray-900">
                    +55 (69) 9.9314-0550
                  </p>
                </div>

                <Button onClick={() => window.open(whatsappLink, '_blank')} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 h-auto text-base" size="lg">
                  <WhatsAppIcon className="h-5 w-5 mr-2" />
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
              {features.map((feature, index) => <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
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
                </Card>)}
            </div>

            {/* Secondary CTA */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <Button onClick={handleClose} variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                Explorar Plataforma Depois
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Você sempre pode acessar o WhatsApp através do menu
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};