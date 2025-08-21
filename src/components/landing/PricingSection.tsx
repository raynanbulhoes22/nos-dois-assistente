import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const PricingSection = () => {
  const plans = [
    {
      name: "Básico",
      price: "Grátis",
      period: "para sempre",
      description: "Ideal para começar a organizar suas finanças",
      features: [
        "Registro via WhatsApp",
        "Categorização automática",
        "Relatórios básicos",
        "Até 50 transações/mês"
      ],
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Pro",
      price: "R$ 16,97",
      period: "/mês",
      description: "Para quem quer controle total das finanças",
      features: [
        "Tudo do plano Básico",
        "Transações ilimitadas", 
        "Relatórios avançados",
        "Metas e orçamentos",
        "Insights com IA",
        "Suporte prioritário"
      ],
      cta: "Teste 7 Dias Grátis",
      popular: true
    },
    {
      name: "Premium",
      price: "R$ 21,97", 
      period: "/mês",
      description: "Para casais e famílias que querem organizar tudo",
      features: [
        "Tudo do plano Pro",
        "Até 2 usuários",
        "Compartilhamento de dados",
        "Relatórios familiares",
        "Metas conjuntas",
        "Consultoria mensal"
      ],
      cta: "Teste 7 Dias Grátis",
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            7 DIAS GRÁTIS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha seu <span className="text-primary">plano ideal</span>
          </h2>
          <p className="text-xl text-gray-600">
            Teste por 7 dias, sem compromisso. Cancele quando quiser.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-white rounded-2xl border-2 p-8 hover:shadow-xl transition-shadow ${
                plan.popular ? 'border-primary shadow-lg' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">
                    <Star className="w-3 h-3 mr-1" />
                    MAIS POPULAR
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-600">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button 
                className={`w-full py-3 text-lg ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary-dark text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.cta}
              </Button>

              {plan.name !== "Básico" && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Sem compromisso • Cancele a qualquer momento
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Todas as assinaturas incluem <strong>7 dias grátis</strong> para você testar sem compromisso
          </p>
        </div>
      </div>
    </section>
  );
};