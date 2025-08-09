import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  CreditCard, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Target,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react";
import { FINANCING_TYPE_LABELS } from "@/constants/categories";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useCartoes } from "@/hooks/useCartoes";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useOrcamentoCategorias } from "@/hooks/useOrcamentoCategorias";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useContasParceladas } from "@/hooks/useContasParceladas";
import { usePrevisibilidadeFinanceira } from "@/hooks/usePrevisibilidadeFinanceira";
import { ContaParceladaForm } from "@/components/ContaParceladaForm";
import { TimelinePrevisao } from "@/components/previsibilidade/TimelinePrevisao";
import { AlertaFluxo } from "@/components/previsibilidade/AlertaFluxo";
import { DetalheMensalDialog } from "@/components/previsibilidade/DetalheMensalDialog";

interface OrcamentoCategoria {
  categoria_nome: string;
  valor_orcado: number;
  valor_gasto: number;
  percentual: number;
}

export const Orcamento = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Hooks para dados
  const { fontes, addFonte, updateFonte, deleteFonte, isLoading: fontesLoading, getTotalRendaAtiva } = useFontesRenda();
  const { cartoes, addCartao, updateCartao, deleteCartao, isLoading: cartoesLoading, getTotalLimite } = useCartoes();
  const { getOrcamentoAtual, createOrcamento, updateOrcamento, isLoading: orcamentosLoading } = useOrcamentos();
  const { movimentacoes } = useMovimentacoes();
  const { contas, createConta, updateConta, deleteConta, calcularParcelasProjetadas, getTotalParcelasAtivas, isLoading: contasLoading } = useContasParceladas();

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
  
  // Calcular gastos do mês atual baseado em movimentações
  const gastosDoMes = movimentacoes
    .filter(mov => {
      const dataMovimento = new Date(mov.data);
      return dataMovimento.getMonth() + 1 === mesAtual && 
             dataMovimento.getFullYear() === anoAtual &&
             mov.tipo_movimento === 'saida';
    })
    .reduce((total, mov) => total + mov.valor, 0);

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-card border rounded-xl p-2 shadow-sm">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => navegarMes('anterior')}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-4 py-1 min-w-[160px] text-center">
                  <span className="font-semibold text-sm">
                    {getMesNome(mesAtual)} {anoAtual}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => navegarMes('proximo')}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Carregando seus dados financeiros...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Renda Total</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {formatCurrency(totalRendaAtiva)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">Gastos do Mês</p>
                      <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                        {formatCurrency(gastosDoMes)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Saldo Inicial</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        {formatCurrency(orcamentoAtual?.saldo_inicial || 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Meta Economia</p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {formatCurrency(orcamentoAtual?.meta_economia || 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fontes de Renda */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Fontes de Renda</CardTitle>
                        <p className="text-sm text-muted-foreground">Total: {formatCurrency(totalRendaAtiva)}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setShowFonteModal(true)} className="shadow-md">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fontes.filter(fonte => fonte.ativa).length > 0 ? (
                    <div className="space-y-3">
                      {fontes.filter(fonte => fonte.ativa).map((fonte) => (
                        <div key={fonte.id} className="group p-4 border border-border/50 rounded-xl hover:shadow-md transition-all duration-200 hover:border-border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{fonte.tipo}</h3>
                              {fonte.descricao && (
                                <p className="text-xs text-muted-foreground mt-1">{fonte.descricao}</p>
                              )}
                              <p className="text-lg font-bold text-green-600 mt-2">{formatCurrency(fonte.valor)}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" onClick={() => handleEditFonte(fonte)} className="h-8 w-8 p-0">
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteFonte(fonte.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Nenhuma fonte de renda</h3>
                        <p className="text-sm text-muted-foreground">Adicione suas fontes de renda para começar</p>
                      </div>
                      <Button onClick={() => setShowFonteModal(true)} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeira Fonte
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cartões de Crédito */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Cartões de Crédito</CardTitle>
                        <p className="text-sm text-muted-foreground">Limite: {formatCurrency(totalLimiteCartoes)}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setShowCartaoModal(true)} className="shadow-md">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartoes.filter(cartao => cartao.ativo).length > 0 ? (
                    <div className="space-y-3">
                      {cartoes.filter(cartao => cartao.ativo).map((cartao) => (
                        <div key={cartao.id} className="group p-4 border border-border/50 rounded-xl hover:shadow-md transition-all duration-200 hover:border-border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{cartao.apelido}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                •••• •••• •••• {cartao.ultimos_digitos}
                              </p>
                              {cartao.limite && (
                                <p className="text-lg font-bold text-blue-600 mt-2">{formatCurrency(cartao.limite)}</p>
                              )}
                              {cartao.dia_vencimento && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Vencimento: dia {cartao.dia_vencimento}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" onClick={() => handleEditCartao(cartao)} className="h-8 w-8 p-0">
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteCartao(cartao.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Nenhum cartão cadastrado</h3>
                        <p className="text-sm text-muted-foreground">Adicione seus cartões para melhor controle</p>
                      </div>
                      <Button onClick={() => setShowCartaoModal(true)} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Cartão
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contas Parceladas */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Parcelamentos & Financiamentos</CardTitle>
                      <p className="text-sm text-muted-foreground">Total mensal: {formatCurrency(getTotalParcelasAtivas())}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setShowContaParceladaModal(true)} className="shadow-md">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {contas.filter(conta => {
                  const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
                  return parcelasRestantes > 0;
                }).length > 0 ? (
                  <div className="space-y-3">
                    {contas.filter(conta => {
                      const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
                      return parcelasRestantes > 0;
                    }).map((conta) => {
                      const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
                      const progressoPercent = ((conta.parcelas_pagas / conta.total_parcelas) * 100);
                      const isFinanciamento = conta.tipo_financiamento !== 'parcelamento';
                      const tipoLabel = FINANCING_TYPE_LABELS[conta.tipo_financiamento as keyof typeof FINANCING_TYPE_LABELS] || 'Parcelamento';
                      
                      return (
                        <div key={conta.id} className={`group p-4 border border-border/50 rounded-xl hover:shadow-md transition-all duration-200 hover:border-border ${isFinanciamento ? 'bg-gradient-to-r from-orange-50/30 to-amber-50/30 dark:from-orange-950/10 dark:to-amber-950/10' : 'bg-gradient-to-r from-blue-50/30 to-cyan-50/30 dark:from-blue-950/10 dark:to-cyan-950/10'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  {isFinanciamento ? (
                                    <Building2 className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                  )}
                                  <h3 className="font-semibold text-sm">{conta.nome}</h3>
                                </div>
                                <Badge variant="outline" className={`text-xs ${isFinanciamento ? 'border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300' : 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300'}`}>
                                  {tipoLabel}
                                </Badge>
                                {conta.categoria && (
                                  <Badge variant="secondary" className="text-xs">{conta.categoria}</Badge>
                                )}
                              </div>
                              
                              {/* Instituição Financeira */}
                              {conta.instituicao_financeira && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  📍 {conta.instituicao_financeira}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-3 mb-2">
                                <p className={`text-lg font-bold ${isFinanciamento ? 'text-orange-600' : 'text-blue-600'}`}>
                                  {formatCurrency(conta.valor_parcela)}/mês
                                </p>
                                {conta.taxa_juros && conta.taxa_juros > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conta.taxa_juros}% a.m.
                                  </Badge>
                                )}
                                {conta.debito_automatico && (
                                  <Badge variant="outline" className="text-xs">
                                    🔄 Débito Automático
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{conta.parcelas_pagas}/{conta.total_parcelas} parcelas</span>
                                <span>{parcelasRestantes} restantes</span>
                                <span>Total: {formatCurrency(conta.valor_parcela * conta.total_parcelas)}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => {
                                  setEditingContaParcelada(conta);
                                  setShowContaParceladaModal(true);
                                }} 
                                className="h-8 w-8 p-0"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => deleteConta(conta.id)} 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Barra de Progresso */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium">{progressoPercent.toFixed(1)}%</span>
                            </div>
                            <Progress value={progressoPercent} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Projeção das Próximas Parcelas */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Projeção dos Próximos 6 Meses
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {calcularParcelasProjetadas(6).map((projecao, index) => (
                          <div key={index} className="text-center p-3 bg-background/80 rounded-lg border">
                            <p className="text-xs font-medium text-muted-foreground">
                              {projecao.mes.toString().padStart(2, '0')}/{projecao.ano}
                            </p>
                            <p className="text-sm font-bold text-orange-600 mt-1">
                              {formatCurrency(projecao.valor)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {projecao.contas.length} conta{projecao.contas.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto">
                      <CreditCard className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Nenhuma conta parcelada</h3>
                      <p className="text-sm text-muted-foreground">Adicione suas compras parceladas para melhor previsibilidade</p>
                    </div>
                    <Button onClick={() => setShowContaParceladaModal(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Conta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline de Previsibilidade Financeira */}
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
                {/* Alertas Financeiros */}
                {alertas.length > 0 && (
                  <AlertaFluxo 
                    alertas={alertas} 
                    maxAlertas={3}
                  />
                )}

                {/* Timeline de Previsões */}
                {!isLoadingPrevisibilidade && previsoes.length > 0 && (
                  <TimelinePrevisao
                    previsoes={previsoes}
                    getMesNome={getMesNomeHook}
                    onMesClick={handleMesClick}
                  />
                )}

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
        )}
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