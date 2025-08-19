import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCartoes } from "@/hooks/useCartoes";
import { useCartaoProcessamento } from "@/hooks/useCartaoProcessamento";
import { useCartaoDetection } from "@/hooks/useCartaoDetection";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
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
    dia_vencimento: '',
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
      dia_vencimento: '',
      ativo: true
    });
  };

  const handleAddCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCartao({
        apelido: cartaoForm.apelido,
        ultimos_digitos: cartaoForm.ultimos_digitos,
        limite: cartaoForm.limite,
        limite_disponivel: (cartaoForm.limite_disponivel || cartaoForm.limite).toString(),
        dia_vencimento: parseInt(cartaoForm.dia_vencimento),
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
      dia_vencimento: (cartao.dia_vencimento || '').toString(),
      ativo: cartao.ativo !== false
    });
    setShowCartaoModal(true);
  };

  const handleUpdateCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCartao(editingCartao.id, {
        apelido: cartaoForm.apelido,
        ultimos_digitos: cartaoForm.ultimos_digitos,
        limite: cartaoForm.limite,
        limite_disponivel: cartaoForm.limite_disponivel.toString(),
        dia_vencimento: parseInt(cartaoForm.dia_vencimento),
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Cartões de Crédito
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus cartões, limites e gastos
          </p>
        </div>
        
        <Dialog open={showCartaoModal} onOpenChange={setShowCartaoModal}>
          <DialogTrigger asChild>
            <Button onClick={() => {
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
              
              <div>
                <Label htmlFor="dia_vencimento">Dia do Vencimento</Label>
                <Select 
                  value={cartaoForm.dia_vencimento} 
                  onValueChange={(value) => setCartaoForm({...cartaoForm, dia_vencimento: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 28}, (_, i) => i + 1).map(dia => (
                      <SelectItem key={dia} value={dia.toString()}>
                        Dia {dia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Cartão Detection Alert */}
      <CartaoDetectionAlert />

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Cartões</p>
                <p className="text-2xl font-bold">{cartoesAtivos.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limite Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalLimite)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponível</p>
                <p className={`text-2xl font-bold ${totalDisponivel >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totalDisponivel)}
                </p>
              </div>
              {totalDisponivel >= 0 ? (
                <TrendingUp className="h-8 w-8 text-success" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilização</p>
                <p className="text-2xl font-bold">{percentualUtilizacao.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={percentualUtilizacao} className="mt-2" />
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

      {/* Tabs */}
      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visao-geral" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="limites" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Limites
          </TabsTrigger>
          <TabsTrigger value="faturas-futuras" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Faturas Futuras
          </TabsTrigger>
          <TabsTrigger value="transacoes" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          {/* Gastos do Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gastos do Mês Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Gasto</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(gastosCartoesMes)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Médio</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(cartoesAtivos.length > 0 ? gastosCartoesMes / cartoesAtivos.length : 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">% do Limite</p>
                  <p className="text-xl font-semibold">
                    {totalLimite > 0 ? ((gastosCartoesMes / totalLimite) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Cartões */}
          <Card>
            <CardHeader>
              <CardTitle>Meus Cartões</CardTitle>
            </CardHeader>
            <CardContent>
              {cartoesAtivos.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum cartão ativo encontrado
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adicione seu primeiro cartão para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartoesAtivos.map(cartao => (
                    <LimiteCartaoDisplay
                      key={cartao.id}
                      cartao={cartao}
                      onEdit={() => handleEditCartao(cartao)}
                      onDelete={() => deleteCartao(cartao.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
                        {cartao.dia_vencimento ? ` Vence dia ${cartao.dia_vencimento}` : ' Sem data de vencimento'}
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