import { MessageSquare, Clock, Smartphone } from "lucide-react";

export const WhyWhatsAppSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "30 segundos vs 5 minutos",
      description: "Registre gastos instantaneamente pelo WhatsApp sem abrir outros aplicativos"
    },
    {
      icon: Smartphone,
      title: "Já está no seu celular",
      description: "Use o app que você já conhece e usa todos os dias"
    },
    {
      icon: MessageSquare,
      title: "Simples como uma conversa",
      description: "Fale naturalmente, nossa IA entende e organiza tudo automaticamente"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por que usar o <span className="text-primary">WhatsApp</span> para suas finanças?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforme a forma como você controla seu dinheiro. Rápido, fácil e sem complicação.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* WhatsApp Mockup */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-primary px-4 py-3 text-white font-medium">
              Lyvo - Assistente Financeiro
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-end">
                <div className="bg-primary text-white px-3 py-2 rounded-2xl rounded-br-sm max-w-xs">
                  Gastei R$ 45 no almoço hoje
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm max-w-xs">
                  ✅ Registrado! Categoria: Alimentação<br/>
                  Seu orçamento mensal: R$ 180 restantes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};