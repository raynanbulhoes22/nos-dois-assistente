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
      console.log('🚀 Iniciando checkout para plano:', plan);
      setBusy(true);
      
      const {
        data,
        error
      } = await supabase.functions.invoke("create-checkout", {
        body: {
          plan
        }
      });
      
      console.log('📦 Resposta do checkout:', { data, error });
      
      if (error) throw error;
      
      if (data?.url) {
        console.log('🔗 URL recebida:', data.url);
        
        // Detectar se é mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('📱 É mobile?', isMobile);
        
        if (isMobile) {
          // No mobile, usar window.location.href para garantir que funcione
          console.log('📱 Redirecionando mobile para:', data.url);
          window.location.href = data.url;
        } else {
          // No desktop, abrir em nova aba
          console.log('💻 Abrindo em nova aba:', data.url);
          window.open(data.url, "_blank");
        }
      }
    } catch (e: any) {
      console.error('❌ Erro no checkout:', e);
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
      console.log('🔄 Verificando status da assinatura...');
      
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error('❌ Erro ao verificar assinatura:', error);
        toast({
          title: "Erro ao verificar assinatura",
          description: error.message || "Tente novamente",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Status atualizado:', data);
      setStatus(data as any);
      
      if (data.subscribed) {
        toast({
          title: "Assinatura ativa!",
          description: `Seu plano ${data.subscription_tier} está ativo.`,
        });
      }
    } catch (e: any) {
      console.error('❌ Erro inesperado:', e);
      toast({
        title: "Erro ao verificar assinatura",
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

  // Check for successful payment return and force refresh
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    
    if (success === 'true' || sessionId) {
      console.log('🎉 Retorno do pagamento detectado, forçando atualização...');
      // Force refresh subscription status after successful payment
      setTimeout(() => {
        handleRefresh();
      }, 2000); // Wait 2 seconds for Stripe to process
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  const isFirstTimeUser = localStorage.getItem('redirect_to_subscription') === 'true' || !status?.subscribed && localStorage.getItem(`user_accessed_${user?.email}`) === null;
  return <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 pb-20 sm:pb-8">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-2">
            Controle Total das suas Finanças
          </h1>
        </div>

        {/* Status do Plano Atual */}
        {status && <Card className={`mb-6 sm:mb-8 ${status.subscribed ? 'border-green-500 bg-green-50/50' : 'border-orange-500 bg-orange-50/50'}`}>
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <Badge variant={status.subscribed ? "default" : "secondary"} className={status.subscribed ? "bg-green-500" : ""}>
                  {status.subscribed ? "Plano Ativo" : "Sem Plano"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {status.subscribed ? <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">Plano {status.subscription_tier}</p>
                    <p className="text-sm text-muted-foreground">
                      Válido até: {status.subscription_end ? new Date(status.subscription_end).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handlePortal} disabled={busy} className="w-full sm:w-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Gerenciar Plano
                    </Button>
                    <Button variant="ghost" onClick={handleRefresh} size="sm" className="w-full sm:w-auto">
                      🔄 Atualizar
                    </Button>
                  </div>
                </div> : <p className="text-base sm:text-lg font-semibold">Escolha um plano para começar sua jornada financeira</p>}
            </CardContent>
          </Card>}

        {/* Planos de Preços */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Plano Solo */}
          <Card className={`relative ${status?.subscription_tier === "Solo" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50 transition-colors"}`}>
            {status?.subscription_tier === "Solo" && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-xs">
                Plano Atual
              </Badge>}
            <CardHeader className="px-4 sm:px-6">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold">Plano Solo</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Ideal para uso individual</p>
                <div className="mt-3 sm:mt-4">
                  {loadingPricing ? <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse" /> : <div className="text-2xl sm:text-4xl font-bold">
                      {formatPrice(pricing?.solo.price || 16.97)}
                      <span className="text-sm sm:text-lg font-normal text-muted-foreground">/mês</span>
                    </div>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Controle completo de movimentações</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Relatórios detalhados e gráficos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Planejamento de orçamento</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Análises de tendências</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Suporte dedicado</span>
                </li>
              </ul>
              {status?.subscription_tier !== "Solo" && <Button onClick={() => handleCheckout("solo")} disabled={busy || loadingPricing} className="w-full" variant={status?.subscribed ? "outline" : "default"}>
                  {status?.subscribed ? "Trocar para Solo" : "Começar Agora"}
                </Button>}
            </CardContent>
          </Card>

          {/* Plano Casal */}
          <Card className={`relative ${status?.subscription_tier === "Casal" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50 transition-colors"}`}>
            {status?.subscription_tier === "Casal" && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-xs">
                Plano Atual
              </Badge>}
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                Mais Popular
              </Badge>
            </div>
            <CardHeader className="px-4 sm:px-6">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold">Plano Casal</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Para casais gerenciarem juntos</p>
                <div className="mt-3 sm:mt-4">
                  {loadingPricing ? <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse" /> : <div className="text-2xl sm:text-4xl font-bold">
                      {formatPrice(pricing?.casal.price || 21.97)}
                      <span className="text-sm sm:text-lg font-normal text-muted-foreground">/mês</span>
                    </div>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Tudo do Plano Solo +</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Acesso para 2 usuários</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Sincronização entre contas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Relatórios consolidados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Planejamento financeiro conjunto</span>
                </li>
              </ul>
              {status?.subscription_tier !== "Casal" && <Button onClick={() => handleCheckout("casal")} disabled={busy || loadingPricing} className="w-full">
                  {status?.subscribed ? "Fazer Upgrade" : "Começar Agora"}
                </Button>}
            </CardContent>
          </Card>
        </div>

        {/* Benefícios */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4 px-2">Por que escolher o Lyvo | LucraAI?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Análises Inteligentes</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Insights automáticos para otimizar seus gastos e investimentos
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Segurança Total</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Seus dados protegidos com criptografia de nível bancário
              </p>
            </div>
            <div className="text-center p-4 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Suporte Dedicado</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Equipe especializada para te ajudar em qualquer momento
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        {!status?.subscribed && <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 sm:p-8">
            <h2 className="text-lg sm:text-2xl font-bold mb-2 px-2">Comece sua transformação financeira hoje!</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
              Junte-se a milhares de pessoas que já transformaram suas finanças com o Lyvo | LucraAI
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
              <Button onClick={() => handleCheckout("solo")} disabled={busy || loadingPricing} size="lg" variant="outline" className="w-full">
                Começar com Plano Solo
              </Button>
              <Button onClick={() => handleCheckout("casal")} disabled={busy || loadingPricing} size="lg" className="w-full">
                Começar com Plano Casal
              </Button>
            </div>
          </div>}
      </div>
    </div>;
};