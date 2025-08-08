import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CreditCard, User, Heart, DollarSign, Trash2, Edit3, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useCartoes } from "@/hooks/useCartoes";
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
  const { fontes, addFonte, updateFonte, deleteFonte, isLoading: fontesLoading } = useFontesRenda();
  const { cartoes, addCartao, updateCartao, deleteCartao, isLoading: cartoesLoading } = useCartoes();
  const stats = useFinancialStats();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isConnectingWhatsapp, setIsConnectingWhatsapp] = useState(false);
  const [isRemovingWhatsapp, setIsRemovingWhatsapp] = useState(false);
  
  // Modais
  const [showFonteModal, setShowFonteModal] = useState(false);
  const [showCartaoModal, setShowCartaoModal] = useState(false);
  const [editingFonte, setEditingFonte] = useState<any>(null);
  const [editingCartao, setEditingCartao] = useState<any>(null);
  
  // Formulários
  const [fonteForm, setFonteForm] = useState({
    tipo: '',
    valor: '',
    descricao: '',
    ativa: true
  });
  const [cartaoForm, setCartaoForm] = useState({
    apelido: '',
    ultimos_digitos: '',
    limite: '',
    dia_vencimento: '',
    ativo: true
  });
  
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

  // Funções para fontes de renda
  const handleAddFonte = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addFonte({
      tipo: fonteForm.tipo,
      valor: parseFloat(fonteForm.valor),
      descricao: fonteForm.descricao,
      ativa: fonteForm.ativa
    });
    
    if (success) {
      setShowFonteModal(false);
      setFonteForm({ tipo: '', valor: '', descricao: '', ativa: true });
    }
  };

  const handleEditFonte = (fonte: any) => {
    setEditingFonte(fonte);
    setFonteForm({
      tipo: fonte.tipo,
      valor: fonte.valor.toString(),
      descricao: fonte.descricao || '',
      ativa: fonte.ativa
    });
    setShowFonteModal(true);
  };

  const handleUpdateFonte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFonte) return;
    
    const success = await updateFonte(editingFonte.id, {
      tipo: fonteForm.tipo,
      valor: parseFloat(fonteForm.valor),
      descricao: fonteForm.descricao,
      ativa: fonteForm.ativa
    });
    
    if (success) {
      setShowFonteModal(false);
      setEditingFonte(null);
      setFonteForm({ tipo: '', valor: '', descricao: '', ativa: true });
    }
  };

  // Funções para cartões
  const handleAddCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addCartao({
      apelido: cartaoForm.apelido,
      ultimos_digitos: cartaoForm.ultimos_digitos,
      limite: cartaoForm.limite ? parseFloat(cartaoForm.limite) : undefined,
      dia_vencimento: cartaoForm.dia_vencimento ? parseInt(cartaoForm.dia_vencimento) : undefined,
      ativo: cartaoForm.ativo
    });
    
    if (success) {
      setShowCartaoModal(false);
      setCartaoForm({ apelido: '', ultimos_digitos: '', limite: '', dia_vencimento: '', ativo: true });
    }
  };

  const handleEditCartao = (cartao: any) => {
    setEditingCartao(cartao);
    setCartaoForm({
      apelido: cartao.apelido,
      ultimos_digitos: cartao.ultimos_digitos,
      limite: cartao.limite?.toString() || '',
      dia_vencimento: cartao.dia_vencimento?.toString() || '',
      ativo: cartao.ativo
    });
    setShowCartaoModal(true);
  };

  const handleUpdateCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCartao) return;
    
    const success = await updateCartao(editingCartao.id, {
      apelido: cartaoForm.apelido,
      ultimos_digitos: cartaoForm.ultimos_digitos,
      limite: cartaoForm.limite ? parseFloat(cartaoForm.limite) : undefined,
      dia_vencimento: cartaoForm.dia_vencimento ? parseInt(cartaoForm.dia_vencimento) : undefined,
      ativo: cartaoForm.ativo
    });
    
    if (success) {
      setShowCartaoModal(false);
      setEditingCartao(null);
      setCartaoForm({ apelido: '', ultimos_digitos: '', limite: '', dia_vencimento: '', ativo: true });
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

  if (isLoading || fontesLoading || cartoesLoading) {
    return (
      <div className="container mx-auto p-3 sm:p-6">
        <p className="text-center">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Configurações</h1>

      {/* Estatísticas Financeiras */}
      {stats.alertas.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Inteligentes
          </h2>
          <div className="grid gap-3">
            {stats.alertas.map((alerta) => (
              <Card key={alerta.id} className={`border-l-4 ${
                alerta.tipo === 'sucesso' ? 'border-l-green-500 bg-green-50' :
                alerta.tipo === 'alerta' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-red-500 bg-red-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{alerta.titulo}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{alerta.mensagem}</p>
                    </div>
                    {alerta.acao && (
                      <Button variant="outline" size="sm" className="text-xs">
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

      <div className="space-y-4 sm:space-y-6">
        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Sistema de Casal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Modo Individual</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualizar apenas suas próprias transações
                  </p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div>
                <Label>Código do Grupo</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Digite o código do seu parceiro"
                    value={profile?.grupo_id || ""}
                  />
                  <Button variant="outline">Conectar</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Seu código: <code className="bg-muted px-1 rounded">{user?.id.slice(0, 8)}</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fontes de Renda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Fontes de Renda
              </div>
              <Button size="sm" onClick={() => setShowFonteModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nova Fonte
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fontes.length > 0 ? (
              <div className="space-y-3">
                {fontes.map((fonte) => (
                  <div key={fonte.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{fonte.tipo}</h3>
                      {fonte.descricao && (
                        <p className="text-sm text-muted-foreground">{fonte.descricao}</p>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-medium">{formatCurrency(fonte.valor)}</p>
                        <Badge variant={fonte.ativa ? "default" : "secondary"}>
                          {fonte.ativa ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditFonte(fonte)}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteFonte(fonte.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma fonte de renda cadastrada
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cartões de Crédito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cartões de Crédito
              </div>
              <Button size="sm" onClick={() => setShowCartaoModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Novo Cartão
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cartoes.length > 0 ? (
              <div className="space-y-3">
                {cartoes.map((cartao) => (
                  <div key={cartao.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{cartao.apelido}</h3>
                      <p className="text-sm text-muted-foreground">
                        •••• •••• •••• {cartao.ultimos_digitos}
                      </p>
                      {cartao.dia_vencimento && (
                        <p className="text-xs text-muted-foreground">
                          Vencimento: dia {cartao.dia_vencimento}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        {cartao.limite && (
                          <p className="font-medium">Limite: {formatCurrency(cartao.limite)}</p>
                        )}
                        <Badge variant={cartao.ativo ? "default" : "secondary"}>
                          {cartao.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditCartao(cartao)}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteCartao(cartao.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum cartão cadastrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">E-mail</h3>
                  <p className="text-sm text-muted-foreground">
                    Receber relatórios mensais por e-mail
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Lembretes de Pagamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Alertas sobre vencimentos próximos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Alertas de Orçamento</h3>
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
        <Card>
          <CardHeader>
            <CardTitle>Integração WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Conecte seu WhatsApp para registrar gastos por mensagem ou áudio
              </p>
              
              {(profile as any)?.numero_wpp ? (
                // Número já conectado - mostrar info e opção de remover
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          ✅ WhatsApp Conectado
                        </p>
                        <p className="text-sm text-green-600">
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
                </div>
              ) : (
                // Nenhum número conectado - mostrar formulário
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
              
              <div className="p-3 bg-accent/50 rounded-lg">
                <p className="text-sm">
                  <strong>Como usar:</strong> Envie mensagens como "Gastei R$ 50 no supermercado" 
                  para registrar automaticamente suas despesas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Renda Registrada</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(stats.rendaRegistrada)}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Renda Real</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(stats.rendaReal)}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Gastos Este Mês</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(stats.gastosEsteMes)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Saldo Atual</p>
                <p className={`text-lg font-bold ${stats.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.saldoAtual)}
                </p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Meta de Economia: {stats.percentualMetaEconomia.toFixed(1)}%</p>
                <p className="text-muted-foreground">Transações WhatsApp: {stats.transacoesWhatsApp}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Limite Cartão Total: {formatCurrency(stats.limiteCartaoTotal)}</p>
                <p className="text-muted-foreground">Transações Manuais: {stats.transacoesManuais}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Fonte de Renda */}
      <Dialog open={showFonteModal} onOpenChange={setShowFonteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFonte ? 'Editar' : 'Nova'} Fonte de Renda</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingFonte ? handleUpdateFonte : handleAddFonte} className="space-y-4">
            <div>
              <Label htmlFor="fonte-tipo">Tipo</Label>
              <Select value={fonteForm.tipo} onValueChange={(value) => setFonteForm(prev => ({...prev, tipo: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salário">Salário</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Negócio Próprio">Negócio Próprio</SelectItem>
                  <SelectItem value="Investimentos">Investimentos</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fonte-valor">Valor Mensal</Label>
              <Input
                id="fonte-valor"
                type="number"
                value={fonteForm.valor}
                onChange={(e) => setFonteForm(prev => ({...prev, valor: e.target.value}))}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <Label htmlFor="fonte-descricao">Descrição (opcional)</Label>
              <Input
                id="fonte-descricao"
                value={fonteForm.descricao}
                onChange={(e) => setFonteForm(prev => ({...prev, descricao: e.target.value}))}
                placeholder="Ex: Empresa XYZ, Projeto ABC..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={fonteForm.ativa}
                onCheckedChange={(checked) => setFonteForm(prev => ({...prev, ativa: checked}))}
              />
              <Label>Fonte ativa</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingFonte ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowFonteModal(false);
                  setEditingFonte(null);
                  setFonteForm({ tipo: '', valor: '', descricao: '', ativa: true });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Cartão */}
      <Dialog open={showCartaoModal} onOpenChange={setShowCartaoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCartao ? 'Editar' : 'Novo'} Cartão de Crédito</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingCartao ? handleUpdateCartao : handleAddCartao} className="space-y-4">
            <div>
              <Label htmlFor="cartao-apelido">Apelido do Cartão</Label>
              <Input
                id="cartao-apelido"
                value={cartaoForm.apelido}
                onChange={(e) => setCartaoForm(prev => ({...prev, apelido: e.target.value}))}
                placeholder="Ex: Cartão Principal, Nubank..."
                required
              />
            </div>
            <div>
              <Label htmlFor="cartao-digitos">Últimos 4 Dígitos</Label>
              <Input
                id="cartao-digitos"
                value={cartaoForm.ultimos_digitos}
                onChange={(e) => setCartaoForm(prev => ({...prev, ultimos_digitos: e.target.value}))}
                placeholder="1234"
                maxLength={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="cartao-limite">Limite (opcional)</Label>
              <Input
                id="cartao-limite"
                type="number"
                value={cartaoForm.limite}
                onChange={(e) => setCartaoForm(prev => ({...prev, limite: e.target.value}))}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="cartao-vencimento">Dia do Vencimento (opcional)</Label>
              <Input
                id="cartao-vencimento"
                type="number"
                min="1"
                max="31"
                value={cartaoForm.dia_vencimento}
                onChange={(e) => setCartaoForm(prev => ({...prev, dia_vencimento: e.target.value}))}
                placeholder="Ex: 15"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={cartaoForm.ativo}
                onCheckedChange={(checked) => setCartaoForm(prev => ({...prev, ativo: checked}))}
              />
              <Label>Cartão ativo</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingCartao ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCartaoModal(false);
                  setEditingCartao(null);
                  setCartaoForm({ apelido: '', ultimos_digitos: '', limite: '', dia_vencimento: '', ativo: true });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};