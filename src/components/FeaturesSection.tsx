import { Card } from "@/components/ui/card";
import { 
  MessageCircle, 
  Brain, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  ChartBar, 
  Target, 
  Clock
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeaturesSection = () => {
  const features: Feature[] = [
    {
      icon: <MessageCircle className="w-8 h-8 text-primary" />,
      title: "Controle pelo WhatsApp",
      description: "Registre gastos e receitas diretamente pelo WhatsApp. Simples como enviar uma mensagem."
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Inteligência Artificial",
      description: "IA que aprende seus padrões financeiros e oferece insights personalizados para suas decisões."
    },
    {
      icon: <ChartBar className="w-8 h-8 text-primary" />,
      title: "Relatórios Inteligentes",
      description: "Visualize seus dados financeiros com gráficos dinâmicos e relatórios detalhados."
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Metas e Orçamentos",
      description: "Defina objetivos financeiros e acompanhe seu progresso com alertas inteligentes."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Análise Preditiva",
      description: "Previsões baseadas em seus hábitos para antecipar gastos e planejar melhor o futuro."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta e conformidade com a LGPD."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "100% Mobile",
      description: "Interface otimizada para celular. Controle suas finanças em qualquer lugar."
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Tempo Real",
      description: "Atualizações instantâneas e sincronização em tempo real entre todos os dispositivos."
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-br from-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Recursos que transformam
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubra como nossa plataforma revoluciona o controle financeiro com tecnologia de ponta e facilidade de uso
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-card/80 backdrop-blur-sm"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Mais de 50 funcionalidades inteligentes para otimizar suas finanças
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};