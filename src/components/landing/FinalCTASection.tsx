import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FinalCTASection = () => {
  const guarantees = [
    "7 dias grátis, sem cartão",
    "Cancele a qualquer momento", 
    "Suporte dedicado",
    "Seus dados seguros"
  ];

  return (
    <section className="py-20 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Pronto para transformar suas finanças?
        </h2>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Junte-se a milhares de pessoas que já organizaram sua vida financeira com a Lyvo
        </p>

        <div className="bg-white/10 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-6">
            Teste <span className="bg-white text-primary px-3 py-1 rounded-lg">7 DIAS GRÁTIS</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {guarantees.map((guarantee, index) => (
              <div key={index} className="flex items-center justify-center md:justify-start text-white/90">
                <Check className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                {guarantee}
              </div>
            ))}
          </div>

          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold"
            asChild
          >
            <Link to="/auth?mode=register" className="flex items-center gap-2">
              Começar Teste Grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          
          <p className="text-white/70 text-sm mt-4">
            Sem compromisso • Sem pegadinhas • Cancelamento fácil
          </p>
        </div>

        <p className="text-white/80 text-lg">
          Não perca mais tempo com planilhas complicadas.<br/>
          <strong>Sua vida financeira organizada está a uma mensagem de distância.</strong>
        </p>
      </div>
    </section>
  );
};