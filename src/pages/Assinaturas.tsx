import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
interface Assinatura {
  id: string;
  nome: string;
  descricao?: string;
  frequencia: string;
  valor: number;
  data_inicio: string;
  proxima_renovacao: string;
  renovacao_automatica: boolean;
  ativo: boolean;
}

export const Assinaturas = () => {
  const { user } = useAuth();
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      toast({ title: "Erro ao verificar assinatura", description: e.message || "Tente novamente", variant: "destructive" });
    }
  };

  const fetchAssinaturas = async () => {
    if (!user) return;
    
    try {
      // Por enquanto, vamos simular dados até que as tabelas sejam criadas
      const mockData: Assinatura[] = [
        {
          id: '1',
          nome: 'Netflix',
          descricao: 'Streaming de filmes e séries',
          frequencia: 'mensal',
          valor: 45.90,
          data_inicio: '2024-01-01',
          proxima_renovacao: '2024-02-01',
          renovacao_automatica: true,
          ativo: true
        }
      ];
      setAssinaturas(mockData);
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssinaturas();
    handleRefresh();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalAssinaturas = assinaturas
    .filter(a => a.ativo)
    .reduce((total, a) => total + a.valor, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Carregando assinaturas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assinaturas</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={busy}>Atualizar status</Button>
          <Button onClick={handlePortal} disabled={busy}>Gerenciar assinatura</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Plano Solo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">R$ 16,97</p>
              <p className="text-sm text-muted-foreground">mensal</p>
            </div>
            <Button onClick={() => handleCheckout("solo")} disabled={busy}>Assinar</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Plano Casal</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">R$ 21,97</p>
              <p className="text-sm text-muted-foreground">mensal</p>
            </div>
            <Button onClick={() => handleCheckout("casal")} disabled={busy}>Assinar</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssinaturas)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assinaturas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assinaturas.filter(a => a.ativo).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximas Renovações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assinaturas.filter(a => {
                const renovacao = new Date(a.proxima_renovacao);
                const hoje = new Date();
                const proximosSeteDias = new Date();
                proximosSeteDias.setDate(hoje.getDate() + 7);
                return a.ativo && renovacao <= proximosSeteDias;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          {assinaturas.length > 0 ? (
            <div className="space-y-4">
              {assinaturas.map((assinatura) => (
                <div key={assinatura.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{assinatura.nome}</h3>
                      <Badge variant={assinatura.ativo ? "default" : "secondary"}>
                        {assinatura.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    {assinatura.descricao && (
                      <p className="text-sm text-muted-foreground mb-1">{assinatura.descricao}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {assinatura.frequencia} • Próxima renovação: {formatDate(assinatura.proxima_renovacao)}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold">{formatCurrency(assinatura.valor)}</p>
                    <p className="text-sm text-muted-foreground">/{assinatura.frequencia}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Auto-renovar</span>
                      <Switch checked={assinatura.renovacao_automatica} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma assinatura encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};