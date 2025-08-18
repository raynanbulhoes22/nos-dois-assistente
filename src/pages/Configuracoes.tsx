import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/ui/phone-input";
import { normalizePhoneNumber, validatePhoneNumber as validatePhone } from "@/lib/phone-utils";
import { User, DollarSign, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFinancialStats } from "@/hooks/useFinancialStats";
import { useSubscription } from "@/hooks/useSubscription";
interface Profile {
  id: string;
  nome?: string;
  email?: string;
  grupo_id?: string;
  numero_wpp?: string;
  telefone_conjuge?: string;
  nome_conjuge?: string;
  meta_economia_mensal?: number;
}
export const Configuracoes = () => {
  const {
    user
  } = useAuth();
  const stats = useFinancialStats();
  const {
    status: subscriptionStatus,
    checkSubscription
  } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [spousePhoneNumber, setSpousePhoneNumber] = useState("");
  const [isConnectingWhatsapp, setIsConnectingWhatsapp] = useState(false);
  const [isRemovingWhatsapp, setIsRemovingWhatsapp] = useState(false);
  const {
    toast
  } = useToast();
  const fetchData = async () => {
    if (!user) return;
    try {
      // Buscar perfil
      const {
        data: profileData,
        error: profileError
      } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      setProfile(profileData);
      setWhatsappNumber((profileData as any)?.numero_wpp || "");
      setSpousePhoneNumber((profileData as any)?.telefone_conjuge || "");
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const validatePhoneNumber = (phone: string): boolean => {
    // Usar a função de validação da lib
    return validatePhone(phone);
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
      // Normalizar o número para o formato 556992290572
      const normalizedPhone = normalizePhoneNumber(whatsappNumber);
      console.log('Conectando WhatsApp com número normalizado:', normalizedPhone);
      const {
        error
      } = await supabase.from('profiles').update({
        numero_wpp: normalizedPhone
      } as any).eq('id', user.id);
      if (error) throw error;

      // Atualizar o estado local
      setProfile(prev => prev ? {
        ...prev,
        numero_wpp: normalizedPhone
      } : null);
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
      const {
        error
      } = await supabase.from('profiles').update({
        numero_wpp: null
      } as any).eq('id', user.id);
      if (error) throw error;

      // Limpar o estado local
      setProfile(prev => prev ? {
        ...prev,
        numero_wpp: null
      } : null);
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
  const handleConnectSpouseWhatsapp = async () => {
    if (!user) return;
    if (!validatePhoneNumber(spousePhoneNumber)) {
      toast({
        title: "❌ Número inválido",
        description: "Verifique o número do cônjuge e tente novamente.",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        telefone_conjuge: spousePhoneNumber
      } as any).eq('id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? {
        ...prev,
        telefone_conjuge: spousePhoneNumber
      } : null);
      toast({
        title: "✅ Sucesso!",
        description: "Número do cônjuge conectado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao conectar WhatsApp do cônjuge:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível conectar o número do cônjuge. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const handleDisconnectSpouseWhatsapp = async () => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        telefone_conjuge: null
      } as any).eq('id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? {
        ...prev,
        telefone_conjuge: null
      } : null);
      setSpousePhoneNumber("");
      toast({
        title: "✅ Sucesso!",
        description: "Número do cônjuge removido com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp do cônjuge:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover o número do cônjuge. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        nome: profile.nome,
        meta_economia_mensal: profile.meta_economia_mensal
      }).eq('id', user.id);
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
    checkSubscription();
  }, [user]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const isCouplesPlan = subscriptionStatus?.subscription_tier === 'Casal';
  if (isLoading) {
    return <div className="container mx-auto p-3 sm:p-6">
        <p className="text-center">Carregando configurações...</p>
      </div>;
  }
  return <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Gerencie suas preferências e configurações do sistema</p>
        </div>

        {/* Estatísticas Financeiras */}
        {stats.alertas.length > 0 && <div className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="icon-container icon-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Alertas Inteligentes</h2>
            </div>
            <div className="grid gap-4">
              {stats.alertas.map(alerta => <Card key={alerta.id} className={`card-modern border-l-4 ${alerta.tipo === 'sucesso' ? 'border-l-green-500 bg-success-muted' : alerta.tipo === 'alerta' ? 'border-l-yellow-500 bg-warning-muted' : 'border-l-red-500 bg-error-muted'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{alerta.titulo}</h3>
                        <p className="text-muted-foreground mt-1">{alerta.mensagem}</p>
                      </div>
                      {alerta.acao && <Button variant="outline" size="sm">
                          {alerta.acao}
                        </Button>}
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>}

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
                <Input id="nome" value={profile?.nome || ""} onChange={e => setProfile(prev => prev ? {
                  ...prev,
                  nome: e.target.value
                } : null)} placeholder="Seu nome" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="meta-economia">Meta de Economia Mensal</Label>
              <Input id="meta-economia" type="number" value={profile?.meta_economia_mensal || ""} onChange={e => setProfile(prev => prev ? {
                ...prev,
                meta_economia_mensal: parseFloat(e.target.value) || 0
              } : null)} placeholder="1000" />
            </div>
            <div className="mt-4">
              <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
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
                  {isCouplesPlan ? "Conecte seu WhatsApp e o do seu cônjuge para registrar gastos por mensagem ou áudio" : "Conecte seu WhatsApp para registrar gastos por mensagem ou áudio"}
                </p>
                
                {(profile as any)?.numero_wpp ? <div className="p-4 bg-success-muted border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-success">
                          ✅ WhatsApp Conectado
                        </p>
                        <p className="text-sm text-success">
                          Número: {(profile as any).numero_wpp}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleDisconnectWhatsapp} disabled={isRemovingWhatsapp} className="text-red-600 border-red-200 hover:bg-red-50">
                        {isRemovingWhatsapp ? "Removendo..." : "Remover"}
                      </Button>
                    </div>
                  </div> : <div className="space-y-4">
                    <div>
                      <Label htmlFor="whatsapp-phone">Número do WhatsApp</Label>
                      <div className="space-y-3 mt-2">
                        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <span className="text-warning text-sm">⚠️</span>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-warning">
                                <strong>Importante:</strong> NÃO coloque o 9 após o DDD
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ✅ Correto: (11) 3333-4444 | ❌ Errado: (11) 93333-4444
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <PhoneInput value={whatsappNumber} onChange={setWhatsappNumber} placeholder="DDD + 8 dígitos" className="flex-1" />
                          <Button variant="outline" onClick={handleConnectWhatsapp} disabled={isConnectingWhatsapp || !whatsappNumber} className="sm:w-auto w-full">
                            {isConnectingWhatsapp ? "Conectando..." : "Conectar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>}
                
                {/* Spouse WhatsApp for Couple Plan */}
                {isCouplesPlan && <div className="space-y-4">
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">WhatsApp do Cônjuge</h3>
                      {(profile as any)?.telefone_conjuge ? <div className="p-4 bg-success-muted border border-green-200 dark:border-green-800 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-success">
                                ✅ WhatsApp do Cônjuge Conectado
                              </p>
                              <p className="text-sm text-success">
                                Número: {(profile as any).telefone_conjuge}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDisconnectSpouseWhatsapp} className="text-red-600 border-red-200 hover:bg-red-50">
                              Remover
                            </Button>
                          </div>
                        </div> : <div className="space-y-4">
                          <div>
                            <Label htmlFor="spouse-whatsapp-phone">Número do WhatsApp do Cônjuge</Label>
                            <div className="space-y-3 mt-2">
                              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <span className="text-warning text-sm">⚠️</span>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-warning">
                                      <strong>Importante:</strong> NÃO coloque o 9 após o DDD
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ✅ Correto: (11) 3333-4444 | ❌ Errado: (11) 93333-4444
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2">
                                <PhoneInput value={spousePhoneNumber} onChange={setSpousePhoneNumber} placeholder="DDD + 8 dígitos" className="flex-1" />
                                <Button variant="outline" onClick={handleConnectSpouseWhatsapp} disabled={!spousePhoneNumber} className="sm:w-auto w-full">
                                  Conectar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>}
                    </div>
                  </div>}
                
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
            
            
          </Card>
        </div>
      </div>
    </div>;
};