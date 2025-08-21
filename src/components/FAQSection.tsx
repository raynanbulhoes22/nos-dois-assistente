import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, ArrowRight } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

export const FAQSection = () => {
  const faqs: FAQ[] = [
    {
      question: "Como funciona o controle pelo WhatsApp?",
      answer: "Você adiciona nosso bot no WhatsApp e registra gastos enviando mensagens simples como 'Gastei R$ 50 no supermercado'. A IA processa automaticamente e categoriza suas transações. É como ter um assistente financeiro pessoal no seu celular."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim, totalmente seguros. Utilizamos criptografia de ponta, somos compliance com a LGPD e seus dados nunca são compartilhados. Todos os servidores são no Brasil e seguimos os mais altos padrões de segurança bancária."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Claro! Você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento. Seus dados ficam disponíveis por 30 dias após o cancelamento para que você possa fazer backup se desejar."
    },
    {
      question: "Como funciona o teste grátis?",
      answer: "Você tem 7 dias completos para testar todas as funcionalidades premium. Precisamos do cartão apenas para validação, mas você não é cobrado durante o período de teste. Se cancelar antes de 7 dias, não paga nada."
    },
    {
      question: "Funciona para casais?",
      answer: "Perfeitamente! O plano Casal permite que duas pessoas compartilhem a mesma conta, vejam as transações em tempo real e tenham relatórios consolidados. Ideal para quem quer gerenciar as finanças em conjunto."
    },
    {
      question: "Preciso ter conhecimento técnico?",
      answer: "Não! Nossa plataforma foi desenvolvida para ser super intuitiva. Se você sabe usar WhatsApp, já sabe usar nosso sistema. Além disso, oferecemos suporte especializado e tutoriais em vídeo para ajudar."
    },
    {
      question: "A IA realmente funciona?",
      answer: "Sim! Nossa IA aprende com seus hábitos e oferece insights personalizados, detecta padrões de gastos, sugere economias e até prevê possíveis problemas financeiros. Quanto mais você usa, mais inteligente fica."
    },
    {
      question: "Posso usar em múltiplos bancos e cartões?",
      answer: "Sim! Você pode conectar quantos bancos e cartões quiser. A plataforma consolida tudo em um lugar só, dando uma visão completa das suas finanças, independente de onde está seu dinheiro."
    }
  ];

  return (
    <section id="faq" className="py-20 px-4 bg-gradient-to-br from-muted/10 to-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 mx-auto">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Tire suas dúvidas sobre como revolucionar seu controle financeiro
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="p-8 border-0 bg-card/60 backdrop-blur-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Ainda tem dúvidas?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nossa equipe de especialistas está pronta para ajudar você a transformar sua vida financeira. 
              Entre em contato conosco pelo WhatsApp e tire todas as suas dúvidas.
            </p>
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground group"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com Especialista
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};