import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Heart, DollarSign, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFinancialStats } from "@/hooks/useFinancialStats";

interface Profile {
  id: string;
  nome?: string;
  email?: string;
  grupo_id?: string;
  numero_wpp?: string;
  meta_economia_mensal?: number;
}

export const Configuracoes = () => {
  const { user } = useAuth();
  const stats = useFinancialStats();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isConnectingWhatsapp, setIsConnectingWhatsapp] = useState(false);
  const [isRemovingWhatsapp, setIsRemovingWhatsapp] = useState(false);
  
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);
      setWhatsappNumber((profileData as any)?.numero_wpp || "");

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizePhoneNumber = (phone: string): string => {
    // Remove todos os caracteres que não são dígitos
    return phone.replace(/\D/g, '');
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const normalized = normalizePhoneNumber(phone);
    // Deve ter entre 10 e 15 dígitos
    return normalized.length >= 10 && normalized.length <= 15;
  };

  const handleConnectWhatsapp = async () => {
    if (!user) return;

    if (!validatePhoneNumber(whatsappNumber)) {
      toast({
        title: "❌ Número inválido",
        description: "Verifique e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    setIsConnectingWhatsapp(true);

    try {
      const normalizedNumber = normalizePhoneNumber(whatsappNumber);
      
      const { error } = await supabase
        .from('profiles')
        .update({ numero_wpp: normalizedNumber } as any)
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar o estado local
      setProfile(prev => prev ? { ...prev, numero_wpp: normalizedNumber } : null);
      
      toast({
        title: "✅ Sucesso!",
        description: "Seu número foi conectado com sucesso!"
      });

    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível conectar seu número. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConnectingWhatsapp(false);
    }
  };

  const handleDisconnectWhatsapp = async () => {
    if (!user) return;

    setIsRemovingWhatsapp(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ numero_wpp: null } as any)
        .eq('id', user.id);

      if (error) throw error;

      // Limpar o estado local
      setProfile(prev => prev ? { ...prev, numero_wpp: null } : null);
      setWhatsappNumber("");
      
      toast({
        title: "✅ Sucesso!",
        description: "Número do WhatsApp removido com sucesso!"
      });

    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover o número. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRemovingWhatsapp(false);
    }
  };


  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          nome: profile.nome,
          meta_economia_mensal: profile.meta_economia_mensal 
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Perfil atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-3 sm:p-6">
        <p className="text-center">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Gerencie suas preferências e configurações do sistema</p>
        </div>

        {/* Estatísticas Financeiras */}
        {stats.alertas.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="icon-container icon-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Alertas Inteligentes</h2>
            </div>
            <div className="grid gap-4">
              {stats.alertas.map((alerta) => (
                <Card key={alerta.id} className={`card-modern border-l-4 ${
                  alerta.tipo === 'sucesso' ? 'border-l-green-500 bg-success-muted' :
                  alerta.tipo === 'alerta' ? 'border-l-yellow-500 bg-warning-muted' :
                  'border-l-red-500 bg-error-muted'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{alerta.titulo}</h3>
                        <p className="text-muted-foreground mt-1">{alerta.mensagem}</p>
                      </div>
                      {alerta.acao && (
                        <Button variant="outline" size="sm">
                          {alerta.acao}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Perfil do Usuário */}
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="icon-container icon-primary">
                  <User className="h-5 w-5" />
                </div>
                Perfil do Usuário
              </CardTitle>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={profile?.nome || ""}
                  onChange={(e) => setProfile(prev => prev ? {...prev, nome: e.target.value} : null)}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="meta-economia">Meta de Economia Mensal</Label>
              <Input
                id="meta-economia"
                type="number"
                value={profile?.meta_economia_mensal || ""}
                onChange={(e) => setProfile(prev => prev ? {...prev, meta_economia_mensal: parseFloat(e.target.value) || 0} : null)}
                placeholder="1000"
              />
            </div>
            <div className="mt-4">
              <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
            </div>
          </CardContent>
          </Card>

          {/* Sistema de Casal */}
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="icon-container bg-pink-100 dark:bg-pink-900/20 text-pink-600">
                  <Heart className="h-5 w-5" />
                </div>
                Sistema de Casal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Modo Individual</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualizar apenas suas próprias transações
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-base font-semibold">Código do Grupo</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Digite o código do seu parceiro"
                      value={profile?.grupo_id || ""}
                    />
                    <Button variant="outline">Conectar</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Seu código: <code className="bg-muted px-2 py-1 rounded text-xs">{user?.id.slice(0, 8)}</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="icon-container bg-orange-100 dark:bg-orange-900/20 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p className="text-sm text-muted-foreground">
                      Receber relatórios mensais por e-mail
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Lembretes de Pagamento</h3>
                    <p className="text-sm text-muted-foreground">
                      Alertas sobre vencimentos próximos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Alertas de Orçamento</h3>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando ultrapassar 80% do orçamento
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integração WhatsApp */}
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="icon-container bg-green-100 dark:bg-green-900/20 text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                Integração WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Conecte seu WhatsApp para registrar gastos por mensagem ou áudio
                </p>
                
                {(profile as any)?.numero_wpp ? (
                  <div className="p-4 bg-success-muted border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-success">
                          ✅ WhatsApp Conectado
                        </p>
                        <p className="text-sm text-success">
                          Número: +{(profile as any).numero_wpp}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDisconnectWhatsapp}
                        disabled={isRemovingWhatsapp}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {isRemovingWhatsapp ? "Removendo..." : "Remover"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="+55 (11) 99999-9999" 
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleConnectWhatsapp}
                      disabled={isConnectingWhatsapp}
                    >
                      {isConnectingWhatsapp ? "Conectando..." : "Conectar"}
                    </Button>
                  </div>
                )}
                
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm">
                    <strong>Como usar:</strong> Envie mensagens como "Gastei R$ 50 no supermercado" 
                    para registrar automaticamente suas despesas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="icon-container icon-success">
                  <DollarSign className="h-5 w-5" />
                </div>
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="metric-grid">
                <div className="text-center p-6 bg-success-muted rounded-xl border">
                  <div className="icon-container icon-success mx-auto mb-3">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Renda Registrada</p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(stats.rendaRegistrada)}
                  </p>
                </div>
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border">
                  <div className="icon-container icon-primary mx-auto mb-3">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Renda Real</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(stats.rendaReal)}
                  </p>
                </div>
                <div className="text-center p-6 bg-error-muted rounded-xl border">
                  <div className="icon-container icon-error mx-auto mb-3">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Gastos Este Mês</p>
                  <p className="text-xl font-bold text-error">
                    {formatCurrency(stats.gastosEsteMes)}
                  </p>
                </div>
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/20 rounded-xl border">
                  <div className="icon-container icon-purple mx-auto mb-3">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
                  <p className={`text-xl font-bold ${stats.saldoAtual >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatCurrency(stats.saldoAtual)}
                  </p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Meta de Economia: <span className="font-semibold">{stats.percentualMetaEconomia.toFixed(1)}%</span></p>
                  <p className="text-muted-foreground">Transações WhatsApp: <span className="font-semibold">{stats.transacoesWhatsApp}</span></p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Limite Cartão Total: <span className="font-semibold">{formatCurrency(stats.limiteCartaoTotal)}</span></p>
                  <p className="text-muted-foreground">Transações Manuais: <span className="font-semibold">{stats.transacoesManuais}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};