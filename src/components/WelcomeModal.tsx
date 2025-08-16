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
  Sparkles,
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
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Acabei de me cadastrar no LucraAI e gostaria de tirar algumas dúvidas.`;

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Completo",
      description: "Visualize suas finanças em tempo real com gráficos e relatórios inteligentes"
    },
    {
      icon: Wallet,
      title: "Controle de Gastos",
      description: "Organize suas receitas e despesas por categorias de forma simples"
    },
    {
      icon: Target,
      title: "Metas Financeiras",
      description: "Defina objetivos e acompanhe seu progresso rumo à liberdade financeira"
    },
    {
      icon: Calendar,
      title: "Planejamento Mensal",
      description: "Monte seu orçamento e antecipe seus compromissos financeiros"
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </Button>

        {/* Header with Gradient */}
        <div className="gradient-primary text-primary-foreground p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-12 w-12 animate-pulse-glow" />
            </div>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                Bem-vindo ao LucraAI! 🎉
              </DialogTitle>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                Sua jornada rumo ao controle financeiro total começa agora. 
                Descubra tudo que nossa plataforma pode fazer por você!
              </p>
            </DialogHeader>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float"></div>
        </div>

        {/* Features Grid */}
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-foreground">
              O que você pode fazer agora
            </h3>
            <p className="text-muted-foreground">
              Explore todos os recursos da nossa plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="icon-container icon-primary flex-shrink-0">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* WhatsApp Support Section */}
          <div className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/30">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-green-500 rounded-full p-3">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-foreground">
                  Precisa de ajuda? Estamos aqui! 💚
                </h4>
                <p className="text-muted-foreground">
                  Agora que você já está cadastrado, pode entrar em contato conosco 
                  diretamente pelo WhatsApp para tirar dúvidas ou receber suporte.
                </p>
                <div className="bg-background/60 rounded-lg p-3 inline-block">
                  <p className="text-sm font-medium text-foreground">
                    📱 +55 (69) 9.9314-0550
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open(whatsappLink, '_blank')}
                className="bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Falar no WhatsApp
              </Button>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 pt-4">
            <Button
              onClick={handleClose}
              size="lg"
              className="button-gradient text-lg px-8 py-3 h-auto"
            >
              Começar agora
            </Button>
            <p className="text-xs text-muted-foreground">
              Você pode acessar o suporte a qualquer momento através do menu
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};