import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, User, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PricingData {
  solo: {
    price: number;
    currency: string;
    interval: string;
  };
  casal: {
    price: number;
    currency: string;
    interval: string;
  };
}

export const PricingSection = () => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-pricing');
      if (error) throw error;
      setPricing(data);
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
      toast.error('Erro ao carregar preços');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: "solo" | "casal") => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    setCheckoutLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast.error('Erro ao iniciar checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const individualFeatures = [
    "Controle completo das finanças",
    "Relatórios e gráficos detalhados",
    "Planejamento de orçamento",
    "Análises preditivas com IA",
    "Suporte especializado"
  ];

  const casalFeatures = [
    "Tudo do Individual +",
    "Acesso para 2 pessoas",
    "Sincronização automática",
    "Relatórios consolidados",
    "Gestão financeira compartilhada"
  ];

  if (loading) {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Escolha seu plano
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Comece sua jornada rumo ao controle financeiro total
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 md:p-8 animate-pulse">
                <div className="h-5 md:h-6 bg-muted rounded mb-3 md:mb-4"></div>
                <div className="h-6 md:h-8 bg-muted rounded mb-4 md:mb-6"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-3 md:h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-12 md:py-16 px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Escolha seu plano
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Comece sua jornada rumo ao controle financeiro total
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Plano Individual - Mobile First */}
          <Card className="p-4 md:p-8 relative border-2 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <div className="text-center mb-4 md:mb-6">
              <div className="inline-flex items-center gap-2 mb-3 md:mb-4">
                <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Individual</h3>
              </div>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-4xl font-bold text-foreground">
                  {pricing ? formatPrice(pricing.solo.price) : formatPrice(11.97)}
                </span>
                <span className="text-sm md:text-base text-muted-foreground">/mês</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Perfeito para quem quer organizar suas finanças pessoais
              </p>
            </div>

            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {individualFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              size="default"
              onClick={() => handleCheckout("solo")}
              disabled={checkoutLoading === "solo"}
            >
              {checkoutLoading === "solo" ? (
                "Processando..."
              ) : (
                <>
                  <CreditCard className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  <span className="text-sm md:text-base">Começar agora</span>
                </>
              )}
            </Button>
          </Card>

          {/* Plano Casal - Mobile First */}
          <Card className="p-4 md:p-8 relative border-2 border-primary shadow-xl md:transform md:scale-105 bg-gradient-to-br from-background to-primary/5">
            <Badge className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs">
              Mais Popular
            </Badge>
            
            <div className="text-center mb-4 md:mb-6 mt-4 md:mt-0">
              <div className="inline-flex items-center gap-2 mb-3 md:mb-4">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Casal</h3>
              </div>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-4xl font-bold text-foreground">
                  {pricing ? formatPrice(pricing.casal.price) : formatPrice(14.97)}
                </span>
                <span className="text-sm md:text-base text-muted-foreground">/mês</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Ideal para casais que querem gerenciar juntos suas finanças
              </p>
            </div>

            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {casalFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              size="default"
              onClick={() => handleCheckout("casal")}
              disabled={checkoutLoading === "casal"}
            >
              {checkoutLoading === "casal" ? (
                "Processando..."
              ) : (
                <>
                  <CreditCard className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  <span className="text-sm md:text-base">Começar agora</span>
                </>
              )}
            </Button>
          </Card>
        </div>

        <div className="text-center mt-8 md:mt-12">
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            ✨ 7 dias grátis • 🔒 100% seguro • 📞 Suporte especializado
          </p>
          <p className="text-xs text-muted-foreground">
            Cartão obrigatório para teste grátis. Cancele a qualquer momento sem taxas.
          </p>
        </div>
      </div>
    </section>
  );
};