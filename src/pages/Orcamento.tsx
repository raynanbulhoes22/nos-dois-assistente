import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Target, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, CreditCard, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useCartoes } from "@/hooks/useCartoes";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useContasParceladas } from "@/hooks/useContasParceladas";
import { usePrevisibilidadeFinanceira } from "@/hooks/usePrevisibilidadeFinanceira";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContaParceladaForm } from "@/components/ContaParceladaForm";
import { TimelinePrevisao } from "@/components/previsibilidade/TimelinePrevisao";
import { AlertaFluxo } from "@/components/previsibilidade/AlertaFluxo";
import { DetalheMensalDialog } from "@/components/previsibilidade/DetalheMensalDialog";
import { QuickActions } from "@/components/orcamento/QuickActions";
import { MetricCard } from "@/components/orcamento/MetricCard";
import { MonthNavigation } from "@/components/orcamento/MonthNavigation";
import { TabSection } from "@/components/orcamento/TabSection";

const FINANCING_TYPE_LABELS = {
  parcelamento: 'Parcelamento',
  financiamento_veiculo: 'Financiamento Veículo',
  financiamento_imovel: 'Financiamento Imóvel',
  emprestimo_pessoal: 'Empréstimo Pessoal',
  consorcio: 'Consórcio',
  outros: 'Outros'
};

interface OrcamentoCategoria {
  categoria_nome: string;
  valor_orcado: number;
  valor_gasto: number;
  percentual: number;
}

export const Orcamento = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Hooks para dados
  const { fontes, addFonte, updateFonte, deleteFonte, isLoading: fontesLoading, getTotalRendaAtiva } = useFontesRenda();
  const { cartoes, addCartao, updateCartao, deleteCartao, isLoading: cartoesLoading, getTotalLimite } = useCartoes();
  const { getOrcamentoAtual, createOrcamento, updateOrcamento, isLoading: orcamentosLoading } = useOrcamentos();
  const { movimentacoes } = useMovimentacoes();
  const { contas, createConta, updateConta, deleteConta, getTotalParcelasAtivas, isLoading: contasLoading } = useContasParceladas();

  // Hook para previsibilidade
  const {
    previsoes,
    alertas,
    isLoading: isLoadingPrevisibilidade,
    getMesNome: getMesNomeHook,
    getProximosDeficits,
    getSaldoProjetado6Meses
  } = usePrevisibilidadeFinanceira();
  
  // Estados para navegação de mês/ano
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  
  // Estados para modais
  const [showFonteModal, setShowFonteModal] = useState(false);
  const [showCartaoModal, setShowCartaoModal] = useState(false);
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false);
  const [showContaParceladaModal, setShowContaParceladaModal] = useState(false);
  const [showDetalheMensal, setShowDetalheMensal] = useState(false);
  const [editingFonte, setEditingFonte] = useState<any>(null);
  const [editingCartao, setEditingCartao] = useState<any>(null);
  const [editingContaParcelada, setEditingContaParcelada] = useState<any>(null);
  const [previsaoSelecionada, setPrevisaoSelecionada] = useState<any>(null);
  
  // Estados para formulários
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
  const [orcamentoForm, setOrcamentoForm] = useState({
    saldo_inicial: '',
    meta_economia: ''
  });
  
  const orcamentoAtual = getOrcamentoAtual();
  const isLoading = fontesLoading || cartoesLoading || orcamentosLoading;

  // Funções auxiliares
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  const handleMesClick = (previsao: any) => {
    setPrevisaoSelecionada(previsao);
    setShowDetalheMensal(true);
  };

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    if (direcao === 'anterior') {
      if (mesAtual === 1) {
        setMesAtual(12);
        setAnoAtual(anoAtual - 1);
      } else {
        setMesAtual(mesAtual - 1);
      }
    } else {
      if (mesAtual === 12) {
        setMesAtual(1);
        setAnoAtual(anoAtual + 1);
      } else {
        setMesAtual(mesAtual + 1);
      }
    }
  };

  // Cálculos do orçamento
  const totalRendaAtiva = getTotalRendaAtiva();
  const totalLimiteCartoes = getTotalLimite();
  const totalParcelasAtivas = getTotalParcelasAtivas();
  
  // Calcular gastos do mês atual baseado em movimentações
  const gastosDoMes = movimentacoes
    .filter(mov => {
      const dataMovimento = new Date(mov.data);
      return dataMovimento.getMonth() + 1 === mesAtual && 
             dataMovimento.getFullYear() === anoAtual &&
             mov.tipo_movimento === 'saida';
    })
    .reduce((total, mov) => total + mov.valor, 0);

  // Função para calcular parcelas projetadas
  const calcularParcelasProjetadas = (meses: number) => {
    const projecoes = [];
    const hoje = new Date();
    
    for (let i = 0; i < meses; i++) {
      const dataProjecao = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mes = dataProjecao.getMonth() + 1;
      const ano = dataProjecao.getFullYear();
      
      const contasDoMes = contas.filter(conta => {
        const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
        return parcelasRestantes > i && conta.ativa;
      });
      
      const valorTotal = contasDoMes.reduce((total, conta) => total + conta.valor_parcela, 0);
      
      projecoes.push({
        mes,
        ano,
        valor: valorTotal,
        contas: contasDoMes
      });
    }
    
    return projecoes;
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

  const handleEditContaParcelada = (conta: any) => {
    setEditingContaParcelada(conta);
    setShowContaParceladaModal(true);
  };

  // Função para criar orçamento
  const handleCreateOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createOrcamento({
      mes: mesAtual,
      ano: anoAtual,
      saldo_inicial: parseFloat(orcamentoForm.saldo_inicial) || 0,
      meta_economia: parseFloat(orcamentoForm.meta_economia) || 0
    });
    
    if (success) {
      setShowOrcamentoModal(false);
      setOrcamentoForm({ saldo_inicial: '', meta_economia: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="loading-spinner"></div>
              <p className="text-muted-foreground">Carregando seus dados financeiros...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Header Moderno */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Orçamento Mensal
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas finanças de forma inteligente e organizada
              </p>
            </div>
            
            {/* Navegação de Mês */}
            <MonthNavigation
              currentMonth={mesAtual}
              currentYear={anoAtual}
              onNavigate={navegarMes}
              getMesNome={getMesNome}
            />
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Alertas Críticos */}
          {alertas.length > 0 && (
            <AlertaFluxo alertas={alertas} maxAlertas={2} />
          )}

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Renda Total"
              value={formatCurrency(totalRendaAtiva)}
              icon={TrendingUp}
              variant="success"
            />
            <MetricCard
              title="Gastos do Mês"
              value={formatCurrency(gastosDoMes)}
              icon={DollarSign}
              variant="error"
            />
            <MetricCard
              title="Saldo Inicial"
              value={formatCurrency(orcamentoAtual?.saldo_inicial || 0)}
              icon={Target}
              variant="primary"
            />
            <MetricCard
              title="Meta Economia"
              value={formatCurrency(orcamentoAtual?.meta_economia || 0)}
              icon={Target}
              variant="purple"
            />
          </div>

          {/* Ações Rápidas */}
          <QuickActions
            onAddFonte={() => setShowFonteModal(true)}
            onAddCartao={() => setShowCartaoModal(true)}
            onAddParcelamento={() => setShowContaParceladaModal(true)}
            onCreateOrcamento={!orcamentoAtual ? () => setShowOrcamentoModal(true) : undefined}
            hasOrcamento={!!orcamentoAtual}
          />

          {/* Seções Organizadas em Tabs */}
          <TabSection
            fontes={fontes}
            cartoes={cartoes}
            contas={contas}
            formatCurrency={formatCurrency}
            totalRendaAtiva={totalRendaAtiva}
            totalLimiteCartoes={totalLimiteCartoes}
            totalParcelasAtivas={totalParcelasAtivas}
            onEditFonte={handleEditFonte}
            onDeleteFonte={deleteFonte}
            onEditCartao={handleEditCartao}
            onDeleteCartao={deleteCartao}
            onEditContaParcelada={handleEditContaParcelada}
            onDeleteContaParcelada={deleteConta}
            onAddFonte={() => setShowFonteModal(true)}
            onAddCartao={() => setShowCartaoModal(true)}
            onAddParcelamento={() => setShowContaParceladaModal(true)}
          />

          {/* Timeline de Previsibilidade */}
          {!isLoadingPrevisibilidade && previsoes.length > 0 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  Previsibilidade Financeira
                  <Badge variant="outline" className="text-xs">
                    Próximos 12 Meses
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TimelinePrevisao
                  previsoes={previsoes}
                  getMesNome={getMesNomeHook}
                  onMesClick={handleMesClick}
                />

                {/* Métricas Resumidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-xl border">
                    <p className="text-sm text-muted-foreground mb-1">Próximos Déficits</p>
                    <p className="text-xl font-bold text-red-600">
                      {getProximosDeficits().length} meses
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border">
                    <p className="text-sm text-muted-foreground mb-1">Saldo 6 Meses</p>
                    <p className={`text-xl font-bold ${getSaldoProjetado6Meses() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(getSaldoProjetado6Meses())}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border">
                    <p className="text-sm text-muted-foreground mb-1">Parcelamentos Ativos</p>
                    <p className="text-xl font-bold text-purple-600">
                      {contas.filter(c => c.ativa).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise do Orçamento */}
          {orcamentoAtual && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  Análise Financeira
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progresso Principal */}
                <div className="p-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">Gastos vs Renda</span>
                    <span className="text-xl font-bold">
                      {totalRendaAtiva > 0 ? ((gastosDoMes / totalRendaAtiva) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={totalRendaAtiva > 0 ? Math.min((gastosDoMes / totalRendaAtiva) * 100, 100) : 0} 
                    className="h-4 mb-2" 
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Gasto: {formatCurrency(gastosDoMes)}</span>
                    <span>Renda: {formatCurrency(totalRendaAtiva)}</span>
                  </div>
                </div>

                {/* Cards de Análise */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border">
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Sobra Estimada</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(Math.max(0, totalRendaAtiva - gastosDoMes))}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Meta de Economia</p>
                    <p className="text-xl font-bold text-blue-600">
                      {orcamentoAtual.meta_economia ? 
                        `${((Math.max(0, totalRendaAtiva - gastosDoMes) / orcamentoAtual.meta_economia) * 100).toFixed(1)}%` : 
                        'Não definida'
                      }
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border">
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Limite Disponível</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatCurrency(totalLimiteCartoes)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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

      {/* Modal Orçamento */}
      <Dialog open={showOrcamentoModal} onOpenChange={setShowOrcamentoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {orcamentoAtual ? 'Editar' : 'Criar'} Orçamento - {getMesNome(mesAtual)} {anoAtual}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrcamento} className="space-y-4">
            <div>
              <Label htmlFor="saldo-inicial">Saldo Inicial</Label>
              <Input
                id="saldo-inicial"
                type="number"
                value={orcamentoForm.saldo_inicial}
                onChange={(e) => setOrcamentoForm(prev => ({...prev, saldo_inicial: e.target.value}))}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="meta-economia">Meta de Economia</Label>
              <Input
                id="meta-economia"
                type="number"
                value={orcamentoForm.meta_economia}
                onChange={(e) => setOrcamentoForm(prev => ({...prev, meta_economia: e.target.value}))}
                placeholder="0,00"
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p><strong>Renda Ativa:</strong> {formatCurrency(totalRendaAtiva)}</p>
              <p><strong>Limite Total:</strong> {formatCurrency(totalLimiteCartoes)}</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {orcamentoAtual ? 'Atualizar' : 'Criar'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowOrcamentoModal(false);
                  setOrcamentoForm({ saldo_inicial: '', meta_economia: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Conta Parcelada */}
      <ContaParceladaForm
        open={showContaParceladaModal}
        onOpenChange={(open) => {
          setShowContaParceladaModal(open);
          if (!open) {
            setEditingContaParcelada(null);
          }
        }}
        onSubmit={editingContaParcelada ? 
          (conta) => updateConta(editingContaParcelada.id, conta) : 
          createConta
        }
        editingConta={editingContaParcelada}
      />

      {/* Modal Detalhe Mensal */}
      <DetalheMensalDialog
        previsao={previsaoSelecionada}
        open={showDetalheMensal}
        onOpenChange={setShowDetalheMensal}
        getMesNome={getMesNomeHook}
      />
    </div>
  );
};
