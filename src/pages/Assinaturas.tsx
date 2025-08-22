import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, TrendingUp, Shield, CreditCard } from "lucide-react";
import { useStripe } from "@/hooks/useStripe";
export const Assinaturas = () => {
  const {
    pricing,
    subscriptionStatus,
    loadingPricing,
    checkoutLoading,
    formatPrice,
    handleCheckout,
    handlePortal,
    checkSubscription
  } = useStripe();
  return <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 pb-20 sm:pb-8">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-2">
            Controle Total das suas Finanças
          </h1>
        </div>

        {/* Status do Plano Atual */}
        {subscriptionStatus && <Card className={`mb-6 sm:mb-8 ${subscriptionStatus.subscribed ? 'border-green-500 bg-green-50/50' : 'border-orange-500 bg-orange-50/50'}`}>
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <Badge variant={subscriptionStatus.subscribed ? "default" : "secondary"} className={subscriptionStatus.subscribed ? "bg-green-500" : ""}>
                  {subscriptionStatus.subscribed ? "Plano Ativo" : "Sem Plano"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {subscriptionStatus.subscribed ? <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">Plano {subscriptionStatus.subscription_tier}</p>
                    <p className="text-sm text-muted-foreground">
                      Válido até: {subscriptionStatus.subscription_end ? new Date(subscriptionStatus.subscription_end).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handlePortal} disabled={checkoutLoading !== null} className="w-full sm:w-auto">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Gerenciar Plano
                    </Button>
                    <Button variant="ghost" onClick={checkSubscription} size="sm" className="w-full sm:w-auto">
                      🔄 Atualizar
                    </Button>
                  </div>
                </div> : <p className="text-base sm:text-lg font-semibold">Escolha um plano para começar sua jornada financeira</p>}
            </CardContent>
          </Card>}

        {/* Planos de Preços */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Plano Solo */}
          <Card className={`relative ${subscriptionStatus?.subscription_tier === "Solo" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50 transition-colors"}`}>
            {subscriptionStatus?.subscription_tier === "Solo" && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-xs">
                Plano Atual
              </Badge>}
            <CardHeader className="px-4 sm:px-6">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold">Plano Solo</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Ideal para uso individual</p>
                <div className="mt-3 sm:mt-4">
                   {loadingPricing ? <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse" /> : <div className="text-2xl sm:text-4xl font-bold">
                      {formatPrice(pricing?.solo.price || 11.97)}
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
              {subscriptionStatus?.subscription_tier !== "Solo" && <Button onClick={() => handleCheckout("solo")} disabled={checkoutLoading !== null || loadingPricing} className="w-full" variant={subscriptionStatus?.subscribed ? "outline" : "default"}>
                  {subscriptionStatus?.subscribed ? "Trocar para Solo" : "Começar Agora"}
                </Button>}
            </CardContent>
          </Card>

          {/* Plano Casal */}
          <Card className={`relative ${subscriptionStatus?.subscription_tier === "Casal" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50 transition-colors"}`}>
            {subscriptionStatus?.subscription_tier === "Casal" && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-xs">
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
                      {formatPrice(pricing?.casal.price || 14.97)}
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
              {subscriptionStatus?.subscription_tier !== "Casal" && <Button onClick={() => handleCheckout("casal")} disabled={checkoutLoading !== null || loadingPricing} className="w-full">
                  {subscriptionStatus?.subscribed ? "Fazer Upgrade" : "Começar Agora"}
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
        {!subscriptionStatus?.subscribed && <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 sm:p-8">
            <h2 className="text-lg sm:text-2xl font-bold mb-2 px-2">Comece sua transformação financeira hoje!</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
              Junte-se a milhares de pessoas que já transformaram suas finanças com o Lyvo | LucraAI
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
              <Button onClick={() => handleCheckout("solo")} disabled={checkoutLoading !== null || loadingPricing} size="lg" variant="outline" className="w-full">
                Começar com Plano Solo
              </Button>
              <Button onClick={() => handleCheckout("casal")} disabled={checkoutLoading !== null || loadingPricing} size="lg" className="w-full">
                Começar com Plano Casal
              </Button>
            </div>
          </div>}
      </div>
    </div>;
};