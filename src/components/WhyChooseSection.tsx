import { MessageCircle, Brain, CreditCard, Target, BarChart3, Calendar, Calculator, Tag } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

const benefits = [
  {
    icon: MessageCircle,
    title: "Controle pelo WhatsApp",
    description: "Gerencie suas finanças no app que você já usa todos os dias. Simples, rápido e sem complicação.",
    highlight: "Diferencial único"
  },
  {
    icon: Brain,
    title: "IA Preditiva Avançada",
    description: "Receba alertas de possíveis déficits com até 12 meses de antecedência e tome decisões inteligentes.",
    highlight: "Tecnologia exclusiva"
  },
  {
    icon: CreditCard,
    title: "Gestão Automática de Cartões",
    description: "Controle limites, faturas futuras e vincule gastos automaticamente aos seus cartões de crédito.",
    highlight: "Automação completa"
  },
  {
    icon: Target,
    title: "Orçamento Inteligente",
    description: "Compare automaticamente suas metas com gastos reais e receba insights para otimizar seu orçamento.",
    highlight: "Comparação em tempo real"
  },
  {
    icon: BarChart3,
    title: "Relatórios com IA",
    description: "Análises comportamentais detalhadas e insights personalizados para melhorar sua saúde financeira.",
    highlight: "Insights personalizados"
  },
  {
    icon: Calendar,
    title: "Calendário Financeiro",
    description: "Visualize todos os seus compromissos financeiros futuros em uma timeline clara e organizada.",
    highlight: "Visão 360°"
  },
  {
    icon: Calculator,
    title: "Simuladores Avançados",
    description: "Simule antecipação de dívidas, cenários de pagamento e tome decisões baseadas em dados.",
    highlight: "Decisões estratégicas"
  },
  {
    icon: Tag,
    title: "Categorização Inteligente",
    description: "Mais de 70 categorias automáticas que organizam seus gastos sem esforço manual.",
    highlight: "70+ categorias"
  }
];

export const WhyChooseSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background via-background/50 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-sm font-medium">
            Por que escolher?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Lyvo | LucraAI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A única plataforma que combina inteligência artificial avançada com a simplicidade do WhatsApp 
            para revolucionar o controle das suas finanças.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index}
                variant="interactive"
                className="group h-full border-border/50 hover:border-primary/30 transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Icon and Highlight */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-secondary/50">
                      {benefit.highlight}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
            <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
              🎯 7 dias grátis
            </Badge>
            <p className="text-foreground font-medium">
              Experimente todos os recursos sem compromisso
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};