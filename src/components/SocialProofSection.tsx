import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Quote
} from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

interface Metric {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
}

export const SocialProofSection = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Marina Silva",
      role: "Empreendedora",
      avatar: "MS",
      content: "Finalmente consegui organizar minhas finanças! O WhatsApp Bot é incrível, registro tudo na hora. Economizei R$ 2.400 no primeiro mês.",
      rating: 5
    },
    {
      name: "Carlos Mendes",
      role: "Professor",
      avatar: "CM",
      content: "A IA me ajuda a entender onde gasto demais. Os relatórios são super claros e as previsões me ajudaram a quitar minhas dívidas.",
      rating: 5
    },
    {
      name: "Ana & João",
      role: "Casal",
      avatar: "AJ",
      content: "Perfeito para casais! Agora os dois conseguimos acompanhar nossos gastos em tempo real. Já conseguimos comprar nossa casa própria.",
      rating: 5
    }
  ];

  const metrics: Metric[] = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      value: "15.000+",
      label: "Usuários Ativos",
      description: "Pessoas transformando suas vidas financeiras"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-success" />,
      value: "R$ 45M+",
      label: "Economia Gerada",
      description: "Valor total economizado pelos usuários"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      value: "87%",
      label: "Melhoria Média",
      description: "Dos usuários melhoram controle financeiro"
    },
    {
      icon: <Shield className="w-8 h-8 text-success" />,
      value: "99.9%",
      label: "Uptime",
      description: "Disponibilidade e confiabilidade"
    }
  ];

  return (
    <section id="social-proof" className="py-12 md:py-20 px-4 bg-gradient-to-br from-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile First */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="outline" className="mb-3 md:mb-4 border-primary/30 text-primary bg-primary/5 text-xs md:text-sm">
            <Star className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Avaliação 4.9/5 estrelas
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Mais de 15.000 pessoas já transformaram suas finanças
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Veja o que nossos usuários estão dizendo sobre os resultados reais que conseguiram
          </p>
        </div>

        {/* Metrics - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-4 md:p-6 text-center border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 mb-3 md:mb-4 mx-auto">
                {metric.icon}
              </div>
              <div className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
                {metric.value}
              </div>
              <div className="text-xs md:text-sm font-semibold text-foreground mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {metric.description}
              </div>
            </Card>
          ))}
        </div>

        {/* Testimonials - Mobile First */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-4 md:p-6 border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 relative">
              <Quote className="absolute top-3 right-3 md:top-4 md:right-4 w-5 h-5 md:w-6 md:h-6 text-primary/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-3 md:mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 md:w-10 md:h-10">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs md:text-sm">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm md:text-base font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators - Mobile Responsive */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center items-center gap-4 md:gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">SSL Criptografado</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">Suporte 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};