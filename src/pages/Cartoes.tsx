import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCartoes } from "@/hooks/useCartoes";
import { useCartaoProcessamento } from "@/hooks/useCartaoProcessamento";
import { useCartaoDetection } from "@/hooks/useCartaoDetection";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { extrairDiaVencimento } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LimiteCartaoDisplay } from "@/components/cartoes/LimiteCartaoDisplay";
import { AlertasCartaoPanel } from "@/components/cartoes/AlertasCartaoPanel";
import { CartaoDetectionAlert } from "@/components/cartoes/CartaoDetectionAlert";
import { FaturasFuturasTab } from "@/components/cartoes/FaturasFuturasTab";
import { FaturasFuturasSection } from "@/components/cartoes/FaturasFuturasSection";
import { formatCurrency } from "@/lib/utils";
import { 
  CreditCard, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Target,
  Calculator,
  BarChart3,
  Settings,
  Eye
} from "lucide-react";
import { toast } from "sonner";

export const Cartoes = () => {
  const { user } = useAuth();
  const { 
    cartoes, 
    addCartao, 
    updateCartao, 
    deleteCartao, 
    getTotalLimite, 
    isLoading 
  } = useCartoes();
  
  const { alertasCartoes, verificarAlertas, isProcessing } = useCartaoProcessamento();
  const { movimentacoes } = useMovimentacoes();
  
  const [showCartaoModal, setShowCartaoModal] = useState(false);
  const [editingCartao, setEditingCartao] = useState<any>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  
  const [cartaoForm, setCartaoForm] = useState({
    apelido: '',
    ultimos_digitos: '',
    limite: 0,
    limite_disponivel: 0,
    ativo: true
  });

  // Verificar alertas quando os cartões mudarem
  useEffect(() => {
    if (cartoes.length > 0) {
      verificarAlertas(cartoes);
    }
  }, [cartoes, verificarAlertas]);

  // Calcular estatísticas
  const cartoesAtivos = cartoes.filter(c => c.ativo);
  const totalLimite = getTotalLimite();
  const totalUtilizado = cartoesAtivos.reduce((total, cartao) => {
    const limite = Number(cartao.limite || 0);
    const disponivel = Number(cartao.limite_disponivel || limite);
    return total + (limite - disponivel);
  }, 0);
  const totalDisponivel = totalLimite - totalUtilizado;
  const percentualUtilizacao = totalLimite > 0 ? (totalUtilizado / totalLimite) * 100 : 0;

  // Calcular gastos do mês atual com cartões
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  
  const gastosCartoesMes = movimentacoes
    .filter(mov => {
      const dataMovimento = new Date(mov.data);
      return dataMovimento.getMonth() + 1 === mesAtual && 
             dataMovimento.getFullYear() === anoAtual &&
             mov.tipo_movimento === 'saida' &&
             mov.forma_pagamento === 'cartao_credito';
    })
    .reduce((total, mov) => total + Number(mov.valor || 0), 0);

  // Handlers
  const resetCartaoForm = () => {
    setCartaoForm({
      apelido: '',
      ultimos_digitos: '',
      limite: 0,
      limite_disponivel: 0,
      ativo: true
    });
  };

  const handleAddCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCartao({
        nome: cartaoForm.apelido,
        apelido: cartaoForm.apelido,
        ultimos_digitos: cartaoForm.ultimos_digitos,
        limite: cartaoForm.limite,
        limite_disponivel: (cartaoForm.limite_disponivel || cartaoForm.limite).toString(),
        ativo: cartaoForm.ativo
      });
      setShowCartaoModal(false);
      resetCartaoForm();
    } catch (error) {
      toast.error('Erro ao adicionar cartão');
    }
  };

  const handleEditCartao = (cartao: any) => {
    setEditingCartao(cartao);
    setCartaoForm({
      apelido: cartao.apelido || '',
      ultimos_digitos: cartao.ultimos_digitos || '',
      limite: cartao.limite || 0,
      limite_disponivel: parseFloat(cartao.limite_disponivel) || cartao.limite || 0,
      ativo: cartao.ativo !== false
    });
    setShowCartaoModal(true);
  };

  const handleUpdateCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCartao(editingCartao.id, {
        nome: cartaoForm.apelido,
        apelido: cartaoForm.apelido,
        ultimos_digitos: cartaoForm.ultimos_digitos,
        limite: cartaoForm.limite,
        limite_disponivel: cartaoForm.limite_disponivel.toString(),
        ativo: cartaoForm.ativo
      });
      setShowCartaoModal(false);
      setEditingCartao(null);
      resetCartaoForm();
    } catch (error) {
      toast.error('Erro ao atualizar cartão');
    }
  };

  const handleDismissAlert = (index: number) => {
    setDismissedAlerts(prev => [...prev, index]);
  };

  // Filtrar alertas não dispensados
  const alertasVisiveis = alertasCartoes.filter((_, index) => !dismissedAlerts.includes(index));

  // SEO
  useEffect(() => {
    document.title = "Cartões de Crédito | Gerenciamento Financeiro";
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cartões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header com Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Meus Cartões
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie cartões, programe faturas e controle limites
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={showCartaoModal} onOpenChange={setShowCartaoModal}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                setEditingCartao(null);
                resetCartaoForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCartao ? 'Editar Cartão' : 'Adicionar Cartão'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={editingCartao ? handleUpdateCartao : handleAddCartao} className="space-y-4">
                <div>
                  <Label htmlFor="apelido">Apelido do Cartão</Label>
                  <Input
                    id="apelido"
                    value={cartaoForm.apelido}
                    onChange={(e) => setCartaoForm({...cartaoForm, apelido: e.target.value})}
                    placeholder="Ex: Cartão Principal"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ultimos_digitos">Últimos 4 Dígitos</Label>
                  <Input
                    id="ultimos_digitos"
                    value={cartaoForm.ultimos_digitos}
                    onChange={(e) => setCartaoForm({...cartaoForm, ultimos_digitos: e.target.value})}
                    placeholder="0000"
                    maxLength={4}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="limite">Limite Total</Label>
                  <CurrencyInput
                    value={cartaoForm.limite}
                    onChange={(value) => setCartaoForm({...cartaoForm, limite: value || 0})}
                    placeholder="R$ 0,00"
                  />
                </div>
                
                 <div>
                   <Label htmlFor="limite_disponivel">Limite Disponível</Label>
                   <CurrencyInput
                     value={cartaoForm.limite_disponivel}
                     onChange={(value) => setCartaoForm({...cartaoForm, limite_disponivel: value || 0})}
                     placeholder="R$ 0,00"
                   />
                 </div>
                 
                 <div className="flex items-center space-x-2">
                   <Switch
                    id="ativo"
                    checked={cartaoForm.ativo}
                    onCheckedChange={(checked) => setCartaoForm({...cartaoForm, ativo: checked})}
                  />
                  <Label htmlFor="ativo">Cartão Ativo</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCartaoModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCartao ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cartão Detection Alert */}
      <CartaoDetectionAlert />

      {/* Cards de Resumo Melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -mr-8 -mt-8"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cartões Ativos</p>
                <p className="text-3xl font-bold">{cartoesAtivos.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cartoes.length - cartoesAtivos.length} inativos
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limite Total</p>
                <p className="text-3xl font-bold">{formatCurrency(totalLimite)}</p>
                <p className="text-xs text-success mt-1">
                  Disponível: {formatCurrency(totalDisponivel)}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8 ${
            totalDisponivel >= 0 ? 'bg-success/10' : 'bg-destructive/10'
          }`}></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Crédito Disponível</p>
                <p className={`text-3xl font-bold ${totalDisponivel >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totalDisponivel)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalLimite - totalDisponivel) / totalLimite * 100 || 0).toFixed(1)}% usado
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                totalDisponivel >= 0 ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                {totalDisponivel >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-warning/10 rounded-full -mr-8 -mt-8"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gasto do Mês</p>
                <p className="text-3xl font-bold text-warning">{formatCurrency(gastosCartoesMes)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Média: {formatCurrency(cartoesAtivos.length > 0 ? gastosCartoesMes / cartoesAtivos.length : 0)}
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alertasVisiveis.length > 0 && (
        <AlertasCartaoPanel 
          alertas={alertasVisiveis}
          onDismiss={handleDismissAlert}
        />
      )}

      {/* Seção de Faturas Futuras em Destaque */}
      <FaturasFuturasSection />

      {/* Tabs Simplificadas */}
      <Tabs defaultValue="cartoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cartoes" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Meus Cartões
          </TabsTrigger>
          <TabsTrigger value="limites" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Controle de Limites
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cartoes" className="space-y-6">
          {cartoesAtivos.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">Nenhum cartão cadastrado</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Adicione seu primeiro cartão para começar a gerenciar seus limites e programar faturas futuras.
                </p>
                <Button onClick={() => setShowCartaoModal(true)} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar Primeiro Cartão
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Gastos do Mês Atual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-warning" />
                    </div>
                    Resumo do Mês Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Gasto</p>
                      <p className="text-2xl font-bold text-destructive">
                        {formatCurrency(gastosCartoesMes)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Valor Médio</p>
                      <p className="text-xl font-semibold text-blue-500">
                        {formatCurrency(cartoesAtivos.length > 0 ? gastosCartoesMes / cartoesAtivos.length : 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">% do Limite</p>
                      <p className="text-xl font-semibold text-warning">
                        {totalLimite > 0 ? ((gastosCartoesMes / totalLimite) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Cartões Melhorada */}
              <Card>
                <CardHeader>
                  <CardTitle>Seus Cartões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {cartoesAtivos.map(cartao => (
                      <LimiteCartaoDisplay
                        key={cartao.id}
                        cartao={cartao}
                        onEdit={() => handleEditCartao(cartao)}
                        onDelete={() => deleteCartao(cartao.id)}
                        className="hover:shadow-md transition-shadow"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="limites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Limites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cartoesAtivos.map(cartao => {
                  const limite = Number(cartao.limite || 0);
                  const disponivel = Number(cartao.limite_disponivel || limite);
                  const utilizado = limite - disponivel;
                  const percentual = limite > 0 ? (utilizado / limite) * 100 : 0;

                  return (
                    <div key={cartao.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{cartao.apelido}</h4>
                          <p className="text-sm text-muted-foreground">
                            Final {cartao.ultimos_digitos}
                          </p>
                        </div>
                        <Badge variant={percentual > 80 ? "destructive" : percentual > 50 ? "secondary" : "default"}>
                          {percentual.toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <Progress value={percentual} className="h-3" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Limite Total</p>
                          <p className="font-medium">{formatCurrency(limite)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilizado</p>
                          <p className="font-medium text-destructive">{formatCurrency(utilizado)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Disponível</p>
                          <p className="font-medium text-success">{formatCurrency(disponivel)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturas-futuras" className="space-y-6">
          <FaturasFuturasTab />
        </TabsContent>

        <TabsContent value="transacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações dos Cartões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartoes.map(cartao => (
                  <div key={cartao.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{cartao.apelido}</h4>
                       <p className="text-sm text-muted-foreground">
                         Final {cartao.ultimos_digitos} • 
                         {cartao.data_vencimento ? ` Vence dia ${extrairDiaVencimento(cartao.data_vencimento)}` : ' Sem data de vencimento'}
                       </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={cartao.ativo ? "default" : "secondary"}>
                        {cartao.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCartao(cartao)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};