import { 
  Clock, 
  MessageSquare, 
  BarChart3, 
  Smartphone,
  Shield,
  Headphones
} from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Economia de tempo",
      description: "Registre gastos em segundos, sem precisar abrir apps ou fazer login"
    },
    {
      icon: MessageSquare,
      title: "Controle total via WhatsApp", 
      description: "Gerencie tudo pelo aplicativo que você já usa todos os dias"
    },
    {
      icon: BarChart3,
      title: "Relatórios automáticos",
      description: "Receba insights e análises detalhadas sem esforço manual"
    },
    {
      icon: Smartphone,
      title: "Sem apps extras",
      description: "Não ocupe espaço no celular, funciona direto no WhatsApp"
    },
    {
      icon: Shield,
      title: "Segurança bancária", 
      description: "Seus dados financeiros protegidos com criptografia de ponta"
    },
    {
      icon: Headphones,
      title: "Suporte 24/7",
      description: "Nossa equipe está sempre disponível para te ajudar"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por que escolher a <span className="text-primary">Lyvo</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais que um aplicativo financeiro, somos seu assistente pessoal para uma vida financeira organizada
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-primary" />
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
      </div>
    </section>
  );
};