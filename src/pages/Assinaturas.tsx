import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreditCard, X, Settings } from "lucide-react";

export const Assinaturas = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<{ subscribed: boolean; subscription_tier?: string | null; subscription_end?: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleCheckout = async (plan: "solo" | "casal") => {
    try {
      setBusy(true);
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { plan } });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Erro ao iniciar pagamento", description: e.message || "Tente novamente", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handlePortal = async () => {
    try {
      setBusy(true);
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Erro ao abrir portal", description: e.message || "Tente novamente", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setStatus(data as any);
    } catch (e: any) {
      toast({ title: "Erro ao verificar plano", description: e.message || "Tente novamente", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user) {
      handleRefresh();
    }
  }, [user]);

  // Check if user was redirected here for first-time subscription
  const isFirstTimeUser = localStorage.getItem('redirect_to_subscription') === 'true' || 
                         (!status?.subscribed && localStorage.getItem(`user_accessed_${user?.email}`) === null);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meu Plano</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={busy}>
            Atualizar status
          </Button>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {isFirstTimeUser && !status?.subscribed && (
        <Card className="mb-6 border-blue-500 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-500 text-white">
                Bem-vindo ao LucraAI!
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-lg font-semibold">Primeiro acesso detectado</p>
              <p className="text-sm text-muted-foreground">
                Para começar a usar todas as funcionalidades, escolha um dos planos abaixo
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status do Plano em Destaque */}
      {status && !isFirstTimeUser && (
        <Card className={`mb-6 ${status.subscribed ? 'border-green-500 bg-green-50/50' : 'border-orange-500 bg-orange-50/50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Badge variant={status.subscribed ? "default" : "secondary"} className={status.subscribed ? "bg-green-500" : ""}>
                {status.subscribed ? "Plano Ativo" : "Sem Plano"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.subscribed ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-semibold">Plano {status.subscription_tier}</p>
                    <p className="text-sm text-muted-foreground">
                      Válido até: {status.subscription_end ? new Date(status.subscription_end).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Renovação automática ativa</p>
                  </div>
                </div>
                
                {/* Ações de Gerenciamento */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePortal} 
                    disabled={busy}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Gerenciar Plano
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePortal} 
                    disabled={busy}
                    className="flex items-center gap-2 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                    Cancelar Assinatura
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold">Nenhum plano ativo</p>
                <p className="text-sm text-muted-foreground">Escolha um plano abaixo para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Planos Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className={status?.subscribed && status.subscription_tier === "Solo" ? "border-green-500 bg-green-50/20" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Plano Solo</CardTitle>
              {status?.subscribed && status.subscription_tier === "Solo" && (
                <Badge variant="default" className="bg-green-500">Seu Plano</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">R$ 16,97</p>
              <p className="text-sm text-muted-foreground">mensal</p>
              <p className="text-sm text-muted-foreground mt-2">Ideal para uso individual</p>
            </div>
            {(!status?.subscribed || status.subscription_tier !== "Solo") && (
              <Button onClick={() => handleCheckout("solo")} disabled={busy}>
                {status?.subscribed ? "Trocar" : "Contratar"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className={status?.subscribed && status.subscription_tier === "Casal" ? "border-green-500 bg-green-50/20" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Plano Casal</CardTitle>
              {status?.subscribed && status.subscription_tier === "Casal" && (
                <Badge variant="default" className="bg-green-500">Seu Plano</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">R$ 21,97</p>
              <p className="text-sm text-muted-foreground">mensal</p>
              <p className="text-sm text-muted-foreground mt-2">Para casais gerenciarem juntos</p>
            </div>
            {(!status?.subscribed || status.subscription_tier !== "Casal") && (
              <Button onClick={() => handleCheckout("casal")} disabled={busy}>
                {status?.subscribed ? "Trocar" : "Contratar"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benefícios dos Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Benefícios Inclusos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Todos os Planos Incluem:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Controle completo de movimentações financeiras</li>
                <li>• Relatórios detalhados e gráficos</li>
                <li>• Planejamento de orçamento</li>
                <li>• Controle de dívidas</li>
                <li>• Sincronização em tempo real</li>
                <li>• Suporte técnico dedicado</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Diferencial do Plano Casal:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Acesso compartilhado para 2 usuários</li>
                <li>• Sincronização entre contas do casal</li>
                <li>• Relatórios consolidados</li>
                <li>• Planejamento financeiro conjunto</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};