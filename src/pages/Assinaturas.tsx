import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check, Star, CreditCard, Users, TrendingUp, Shield } from "lucide-react";
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
export const Assinaturas = () => {
  const {
    user
  } = useAuth();
  const [status, setStatus] = useState<{
    subscribed: boolean;
    subscription_tier?: string | null;
    subscription_end?: string | null;
  } | null>(null);
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  const handleCheckout = async (plan: "solo" | "casal") => {
    try {
      setBusy(true);
      const {
        data,
        error
      } = await supabase.functions.invoke("create-checkout", {
        body: {
          plan
        }
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({
        title: "Erro ao iniciar pagamento",
        description: e.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setBusy(false);
    }
  };
  const handlePortal = async () => {
    try {
      setBusy(true);
      const {
        data,
        error
      } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({
        title: "Erro ao abrir portal",
        description: e.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setBusy(false);
    }
  };
  const handleRefresh = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setStatus(data as any);
    } catch (e: any) {
      toast({
        title: "Erro ao verificar plano",
        description: e.message || "Tente novamente",
        variant: "destructive"
      });
    }
  };
  const fetchPricing = async () => {
    try {
      setLoadingPricing(true);
      const {
        data,
        error
      } = await supabase.functions.invoke("get-pricing");
      if (error) throw error;
      setPricing(data);
    } catch (error) {
      console.error("Erro ao buscar preços:", error);
      // Fallback para preços padrão
      setPricing({
        solo: {
          price: 16.97,
          currency: "brl",
          interval: "month"
        },
        casal: {
          price: 21.97,
          currency: "brl",
          interval: "month"
        }
      });
    } finally {
      setLoadingPricing(false);
    }
  };
  useEffect(() => {
    if (user) {
      handleRefresh();
    }
    fetchPricing();
  }, [user]);
  const isFirstTimeUser = localStorage.getItem('redirect_to_subscription') === 'true' || !status?.subscribed && localStorage.getItem(`user_accessed_${user?.email}`) === null;
  return <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Controle Total das suas Finanças
          </h1>
          
        </div>

        {/* Status do Plano Atual */}
        {status && <Card className={`mb-8 ${status.subscribed ? 'border-green-500 bg-green-50/50' : 'border-orange-500 bg-orange-50/50'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Badge variant={status.subscribed ? "default" : "secondary"} className={status.subscribed ? "bg-green-500" : ""}>
                  {status.subscribed ? "Plano Ativo" : "Sem Plano"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status.subscribed ? <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Plano {status.subscription_tier}</p>
                    <p className="text-sm text-muted-foreground">
                      Válido até: {status.subscription_end ? new Date(status.subscription_end).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handlePortal} disabled={busy}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gerenciar Plano
                  </Button>
                </div> : <p className="text-lg font-semibold">Escolha um plano para começar sua jornada financeira</p>}
            </CardContent>
          </Card>}

        {/* Planos de Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {/* Plano Solo */}
          <Card className={`relative ${status?.subscription_tier === "Solo" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50 transition-colors"}`}>
            {status?.subscription_tier === "Solo" && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Plano Atual
              </Badge>}
            <CardHeader>
              <div className="text-center">
                <h3 className="text-2xl font-bold">Plano Solo</h3>
                <p className="text-muted-foreground">Ideal para uso individual</p>
                <div className="mt-4">
                  {loadingPricing ? <div className="h-8 bg-gray-200 rounded animate-pulse" /> : <div className="text-4xl font-bold">
                      {formatPrice(pricing?.solo.price || 16.97)}
                      <span className="text-lg font-normal text-muted-foreground">/mês</span>
                    </div>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Controle completo de movimentações</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Relatórios detalhados e gráficos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Planejamento de orçamento</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Análises de tendências</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Suporte dedicado</span>
                </li>
              </ul>
              {status?.subscription_tier !== "Solo" && <Button onClick={() => handleCheckout("solo")} disabled={busy || loadingPricing} className="w-full" variant={status?.subscribed ? "outline" : "default"}>
                  {status?.subscribed ? "Trocar para Solo" : "Começar Agora"}
                </Button>}
            </CardContent>
          </Card>

          {/* Plano Casal */}
          <Card className={`relative ${status?.subscription_tier === "Casal" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50 transition-colors"}`}>
            {status?.subscription_tier === "Casal" && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Plano Atual
              </Badge>}
            <div className="absolute -top-3 -right-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                Mais Popular
              </Badge>
            </div>
            <CardHeader>
              <div className="text-center">
                <h3 className="text-2xl font-bold">Plano Casal</h3>
                <p className="text-muted-foreground">Para casais gerenciarem juntos</p>
                <div className="mt-4">
                  {loadingPricing ? <div className="h-8 bg-gray-200 rounded animate-pulse" /> : <div className="text-4xl font-bold">
                      {formatPrice(pricing?.casal.price || 21.97)}
                      <span className="text-lg font-normal text-muted-foreground">/mês</span>
                    </div>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Tudo do Plano Solo +</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">Acesso para 2 usuários</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm">Sincronização entre contas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">Relatórios consolidados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Planejamento financeiro conjunto</span>
                </li>
              </ul>
              {status?.subscription_tier !== "Casal" && <Button onClick={() => handleCheckout("casal")} disabled={busy || loadingPricing} className="w-full">
                  {status?.subscribed ? "Fazer Upgrade" : "Começar Agora"}
                </Button>}
            </CardContent>
          </Card>
        </div>

        {/* Benefícios */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Por que escolher o LucraAI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Análises Inteligentes</h3>
              <p className="text-sm text-muted-foreground">
                Insights automáticos para otimizar seus gastos e investimentos
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Segurança Total</h3>
              <p className="text-sm text-muted-foreground">
                Seus dados protegidos com criptografia de nível bancário
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Suporte Dedicado</h3>
              <p className="text-sm text-muted-foreground">
                Equipe especializada para te ajudar em qualquer momento
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        {!status?.subscribed && <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Comece sua transformação financeira hoje!</h2>
            <p className="text-muted-foreground mb-6">
              Junte-se a milhares de pessoas que já transformaram suas finanças com o LucraAI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => handleCheckout("solo")} disabled={busy || loadingPricing} size="lg" variant="outline">
                Começar com Plano Solo
              </Button>
              <Button onClick={() => handleCheckout("casal")} disabled={busy || loadingPricing} size="lg">
                Começar com Plano Casal
              </Button>
            </div>
          </div>}
      </div>
    </div>;
};