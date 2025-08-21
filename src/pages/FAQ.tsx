import { Navigation } from "@/components/Navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Como funciona o período gratuito?",
      answer: "Você pode usar o Lyvo gratuitamente com até 50 transações por mês. Não há limite de tempo para o plano gratuito."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança para proteger seus dados financeiros."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Claro! Você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento."
    },
    {
      question: "Como faço para exportar meus dados?",
      answer: "No plano Pro e Enterprise, você pode exportar seus dados em formato CSV ou PDF através do painel de relatórios."
    },
    {
      question: "Vocês oferecem suporte técnico?",
      answer: "Sim! Oferecemos suporte por email para todos os planos, e suporte prioritário para assinantes Pro e Enterprise."
    },
    {
      question: "Posso conectar minha conta bancária?",
      answer: "Esta funcionalidade está em desenvolvimento. Por enquanto, você pode importar extratos ou adicionar transações manualmente."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h1>
            <p className="text-xl text-muted-foreground">
              Tire suas dúvidas sobre o Lyvo
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Não encontrou sua resposta?
            </p>
            <p className="text-foreground">
              Entre em contato: <a href="mailto:suporte@lyvo.com.br" className="text-primary hover:underline">suporte@lyvo.com.br</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;