import { MessageSquare, Bot, BarChart3 } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      icon: MessageSquare,
      title: "Envie uma mensagem",
      description: "Mande qualquer gasto ou receita pelo WhatsApp de forma natural",
      mockup: "Gastei R$ 50 no supermercado"
    },
    {
      number: "2", 
      icon: Bot,
      title: "Lyvo organiza tudo",
      description: "Nossa IA categoriza automaticamente e atualiza seus dados financeiros",
      mockup: "✅ Registrado em 'Alimentação'"
    },
    {
      number: "3",
      icon: BarChart3,
      title: "Veja seus resultados",
      description: "Acesse relatórios detalhados e insights sobre seus gastos",
      mockup: "📊 Relatório disponível"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como funciona em <span className="text-primary">3 passos simples</span>
          </h2>
          <p className="text-xl text-gray-600">
            Controle suas finanças nunca foi tão fácil
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-primary/20 z-0" 
                     style={{ transform: 'translateX(50%)' }} />
              )}
              
              <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow z-10">
                {/* Step Number */}
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mb-6 mx-auto">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  {step.description}
                </p>

                {/* Mini Mockup */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-center text-gray-700">
                  {step.mockup}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};