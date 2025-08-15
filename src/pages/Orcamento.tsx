import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useCartoes } from "@/hooks/useCartoes";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useContasParceladas } from "@/hooks/useContasParceladas";
import { usePrevisibilidadeFinanceira } from "@/hooks/usePrevisibilidadeFinanceira";
import { useGastosFixos } from "@/hooks/useGastosFixos";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Target, TrendingUp, TrendingDown, DollarSign, AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { ContaParceladaForm } from "@/components/ContaParceladaForm";
import { GastoFixoForm } from "@/components/GastoFixoForm";
import { MiniTimeline } from "@/components/orcamento/MiniTimeline";
import { AlertaFluxo } from "@/components/previsibilidade/AlertaFluxo";
import { DetalheMensalDialog } from "@/components/previsibilidade/DetalheMensalDialog";
import { PrevisaoMesAtual } from "@/components/orcamento/PrevisaoMesAtual";
import { MetricCard } from "@/components/orcamento/MetricCard";
import { MonthNavigation } from "@/components/orcamento/MonthNavigation";
import { TabSection } from "@/components/orcamento/TabSection";
import { CalendarioFinanceiro } from "@/components/calendario/CalendarioFinanceiro";
import { ValoresReaisSection } from "@/components/orcamento/ValoresReaisSection";
import { PerformanceSection } from "@/components/orcamento/PerformanceSection";
import { SaldoInicialCard } from "@/components/orcamento/SaldoInicialCard";

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
  const isMobile = useIsMobile();

  // Estados locais
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [showFonteModal, setShowFonteModal] = useState(false);
  const [showCartaoModal, setShowCartaoModal] = useState(false);
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false);
  const [showContaParceladaModal, setShowContaParceladaModal] = useState(false);
  const [showDetalheMensal, setShowDetalheMensal] = useState(false);
  const [editingFonte, setEditingFonte] = useState<any>(null);
  const [editingCartao, setEditingCartao] = useState<any>(null);
  const [editingContaParcelada, setEditingContaParcelada] = useState<any>(null);
  const [editingGastoFixo, setEditingGastoFixo] = useState<any>(null);
  const [showGastoFixoModal, setShowGastoFixoModal] = useState(false);
  const [detalheMensalData, setDetalheMensalData] = useState<any>(null);

  // Form states
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
    meta_economia: '',
    observacoes: ''
  });

  // Hooks
  const { 
    fontes, 
    addFonte, 
    updateFonte, 
    deleteFonte, 
    getTotalRendaAtiva, 
    isLoading: fontesLoading,
    refetch: refetchFontes 
  } = useFontesRenda();

  const { 
    cartoes, 
    addCartao, 
    updateCartao, 
    deleteCartao, 
    getTotalLimite, 
    isLoading: cartoesLoading,
    refetch: refetchCartoes 
  } = useCartoes();

  const { 
    orcamentos, 
    createOrcamento, 
    updateOrcamento, 
    isLoading: orcamentosLoading,
    refetch: refetchOrcamentos 
  } = useOrcamentos();

  const { 
    movimentacoes, 
    entradas, 
    saidas, 
    isLoading: movimentacoesLoading,
    refetch: refetchMovimentacoes 
  } = useMovimentacoes();

  const { 
    contas, 
    createConta, 
    updateConta, 
    deleteConta, 
    getTotalParcelasAtivas, 
    calcularParcelasProjetadas,
    isLoading: contasLoading,
    refetch: refetchContas 
  } = useContasParceladas();

  const { 
    previsoes, 
    alertas, 
    isLoading: isLoadingPrevisibilidade,
    getMesNome: getMesNomeHook
  } = usePrevisibilidadeFinanceira();

  const { 
    gastosFixos, 
    createGastoFixo, 
    updateGastoFixo, 
    deleteGastoFixo, 
    getTotalGastosFixosAtivos 
  } = useGastosFixos();

  // Loading state
  const isLoading = fontesLoading || cartoesLoading || orcamentosLoading || movimentacoesLoading || contasLoading;

  // Calculados
  const totalRendaAtiva = getTotalRendaAtiva();
  const totalLimiteCartoes = getTotalLimite();
  const totalParcelasAtivas = getTotalParcelasAtivas();
  const totalGastosFixos = getTotalGastosFixosAtivos();
  const orcamentoAtual = orcamentos.find(o => o.mes === mesAtual && o.ano === anoAtual);
  const previsibilidadeStatus = 'sem-dados';

  // Função para formatar moeda
  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para obter nome do mês
  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  // Navegação de mês
  const navegarMes = (direction: 'anterior' | 'proximo') => {
    if (direction === 'anterior') {
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

  // SEO: título da página dinâmico
  useEffect(() => {
    document.title = `Calendário Financeiro | ${getMesNome(mesAtual)} ${anoAtual}`;
  }, [mesAtual, anoAtual]);

  // Handlers
  const handleMesClick = (dadosMes: any) => {
    setDetalheMensalData(dadosMes);
    setShowDetalheMensal(true);
  };

  const handleAddFonte = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFonte({
        tipo: fonteForm.tipo,
        valor: parseFloat(fonteForm.valor),
        descricao: fonteForm.descricao,
        ativa: fonteForm.ativa
      });
      setShowFonteModal(false);
      resetFonteForm();
      toast.success('Fonte de renda adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar fonte de renda');
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
    try {
      await updateFonte(editingFonte.id, {
        tipo: fonteForm.tipo,
        valor: parseFloat(fonteForm.valor),
        descricao: fonteForm.descricao,
        ativa: fonteForm.ativa
      });
      setShowFonteModal(false);
      setEditingFonte(null);
      resetFonteForm();
      toast.success('Fonte de renda atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar fonte de renda');
    }
  };

  const handleAddCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCartao({
        apelido: cartaoForm.apelido,
        ultimos_digitos: cartaoForm.ultimos_digitos,
        limite: parseFloat(cartaoForm.limite),
        dia_vencimento: parseInt(cartaoForm.dia_vencimento),
        ativo: cartaoForm.ativo
      });
      setShowCartaoModal(false);
      resetCartaoForm();
      toast.success('Cartão adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar cartão');
    }
  };

  const handleEditCartao = (cartao: any) => {
    setEditingCartao(cartao);
    setCartaoForm({
      apelido: cartao.apelido,
      ultimos_digitos: cartao.ultimos_digitos,
      limite: cartao.limite.toString(),
      dia_vencimento: cartao.dia_vencimento.toString(),
      ativo: cartao.ativo
    });
    setShowCartaoModal(true);
  };

  const handleUpdateCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCartao(editingCartao.id, {
        apelido: cartaoForm.apelido,
        ultimos_digitos: cartaoForm.ultimos_digitos,
        limite: parseFloat(cartaoForm.limite),
        dia_vencimento: parseInt(cartaoForm.dia_vencimento),
        ativo: cartaoForm.ativo
      });
      setShowCartaoModal(false);
      setEditingCartao(null);
      resetCartaoForm();
      toast.success('Cartão atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar cartão');
    }
  };

  const handleCreateOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrcamento({
        mes: mesAtual,
        ano: anoAtual,
        meta_economia: parseFloat(orcamentoForm.meta_economia)
      });
      setShowOrcamentoModal(false);
      resetOrcamentoForm();
      toast.success('Orçamento criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar orçamento');
    }
  };

  const handleEditContaParcelada = (conta: any) => {
    setEditingContaParcelada(conta);
    setShowContaParceladaModal(true);
  };

  // Handlers para gastos fixos
  const handleEditGastoFixo = (gasto: any) => {
    setEditingGastoFixo(gasto);
    setShowGastoFixoModal(true);
  };

  const handleDeleteGastoFixo = async (id: string) => {
    try {
      await deleteGastoFixo(id);
      toast.success('Gasto fixo removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover gasto fixo');
    }
  };

  const resetFonteForm = () => {
    setFonteForm({
      tipo: '',
      valor: '',
      descricao: '',
      ativa: true
    });
  };

  const resetCartaoForm = () => {
    setCartaoForm({
      apelido: '',
      ultimos_digitos: '',
      limite: '',
      dia_vencimento: '',
      ativo: true
    });
  };

  const resetOrcamentoForm = () => {
    setOrcamentoForm({
      meta_economia: '',
      observacoes: ''
    });
  };

  // Cálculos para métricas
  const totalGastosOrcamento = 0; // orcamentoAtual?.categorias?.reduce((total: number, cat: any) => total + (cat.valor_orcado || 0), 0) || 0;
  const saldoProjetado = totalRendaAtiva - totalParcelasAtivas - totalGastosFixos;

  // Timeline de meses passados (dados reais) e futuros (projeção)
  const LIMIAR_QUASE = 0.05; // 5%

  const calcularStatusMes = (
    receitas: number,
    saldo: number
  ): 'excelente' | 'positivo' | 'critico' | 'deficit' | 'sem-dados' | 'quase_positivo' | 'quase_negativo' => {
    if (receitas <= 0) return 'sem-dados';
    const ratio = saldo / receitas;
    if (ratio < 0) return Math.abs(ratio) <= LIMIAR_QUASE ? 'quase_negativo' : 'deficit';
    if (ratio <= LIMIAR_QUASE) return 'quase_positivo';
    return ratio > 0.3 ? 'excelente' : 'positivo';
  };

  const getParcelasValorNoMes = (mes: number, ano: number) => {
    return contas.reduce((total, conta) => {
      const dataPrimeira = new Date(conta.data_primeira_parcela);
      const mesesDecorridos = (ano - dataPrimeira.getFullYear()) * 12 + (mes - 1 - dataPrimeira.getMonth());
      const parcelaAtual = mesesDecorridos + 1;
      const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
      const ativaNoMes = parcelaAtual > 0 && parcelaAtual <= conta.total_parcelas && parcelaAtual > conta.parcelas_pagas && parcelasRestantes > 0;
      return ativaNoMes ? total + conta.valor_parcela : total;
    }, 0);
  };

  const timelineMeses = useMemo(() => {
    const dotsPerSide = isMobile ? 4 : 6;
    const itens: { mes: number; ano: number; status: string; saldoProjetado: number; receitas: number }[] = [];

    // Meses passados
    for (let i = dotsPerSide; i >= 1; i--) {
      const d = new Date(anoAtual, mesAtual - 1 - i, 1);
      const m = d.getMonth() + 1;
      const a = d.getFullYear();
      const movsMes = movimentacoes.filter(mv => {
        const data = new Date(mv.data);
        return data.getMonth() + 1 === m && data.getFullYear() === a;
      });
      const receitas = movsMes.filter(mv => mv.isEntrada).reduce((s, mv) => s + Math.abs(mv.valor), 0);
      const despesas = movsMes.filter(mv => !mv.isEntrada).reduce((s, mv) => s + Math.abs(mv.valor), 0);
      const saldo = receitas - despesas;
      const status = (receitas === 0 && despesas === 0) ? 'sem-dados' : calcularStatusMes(receitas, saldo);
      itens.push({ mes: m, ano: a, status, saldoProjetado: saldo, receitas });
    }

    // Meses futuros
    for (let i = 1; i <= dotsPerSide; i++) {
      const d = new Date(anoAtual, mesAtual - 1 + i, 1);
      const m = d.getMonth() + 1;
      const a = d.getFullYear();
      const receitas = totalRendaAtiva;
      const parcelas = getParcelasValorNoMes(m, a);
      const gastosFixos = totalGastosFixos;
      const saldo = receitas - (parcelas + gastosFixos);
      const status = receitas <= 0 ? 'sem-dados' : calcularStatusMes(receitas, saldo);
      itens.push({ mes: m, ano: a, status, saldoProjetado: saldo, receitas });
    }

    return itens;
  }, [isMobile, anoAtual, mesAtual, movimentacoes, contas, totalRendaAtiva, totalGastosFixos]);

  const onMonthSelect = (mes: number, ano: number) => {
    setMesAtual(mes);
    setAnoAtual(ano);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Carregando seus dados financeiros...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-2 sm:p-4 lg:p-6 max-w-7xl">
        {/* Header com navegação */}
        <div className="sticky top-0 z-30 mb-4 sm:mb-8 -mx-2 sm:-mx-4 lg:-mx-6 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-b from-background/95 to-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Calendário Financeiro
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Visualize todas suas movimentações em um calendário
              </p>
            </div>
            
            <MonthNavigation
              currentMonth={mesAtual}
              currentYear={anoAtual}
              onNavigate={navegarMes}
              getMesNome={getMesNome}
              statusMes={alertas.length > 0 ? 'critico' : previsibilidadeStatus}
              timeline={timelineMeses}
              onMonthSelect={onMonthSelect}
            />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-6">
          {/* Alertas Críticos */}
          {alertas.length > 0 && (
            <AlertaFluxo alertas={alertas} />
          )}

          {/* Saldo Inicial */}
          <div className="mb-4">
            <div className="max-w-md">
              <SaldoInicialCard mes={mesAtual} ano={anoAtual} />
            </div>
          </div>

          {/* Calendário Principal */}
          <CalendarioFinanceiro 
            mesAtual={mesAtual} 
            anoAtual={anoAtual}
          />

          {/* Seções Compactas em Tabs */}
          <Card className="block">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Configurações Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <TabSection
                fontes={fontes}
                cartoes={cartoes}
                contas={contas}
                gastosFixos={gastosFixos}
                formatCurrency={formatCurrency}
                totalRendaAtiva={totalRendaAtiva}
                totalLimiteCartoes={totalLimiteCartoes}
                totalParcelasAtivas={totalParcelasAtivas}
                totalGastosFixosAtivos={getTotalGastosFixosAtivos()}
                onEditFonte={handleEditFonte}
                onDeleteFonte={deleteFonte}
                onEditCartao={handleEditCartao}
                onDeleteCartao={deleteCartao}
                onEditContaParcelada={handleEditContaParcelada}
                onDeleteContaParcelada={deleteConta}
                onEditGastoFixo={handleEditGastoFixo}
                onDeleteGastoFixo={handleDeleteGastoFixo}
                onAddFonte={() => setShowFonteModal(true)}
                onAddCartao={() => setShowCartaoModal(true)}
                onAddParcelamento={() => setShowContaParceladaModal(true)}
                onAddGastoFixo={() => setShowGastoFixoModal(true)}
              />
            </CardContent>
          </Card>
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
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                value={fonteForm.tipo}
                onChange={(e) => setFonteForm({...fonteForm, tipo: e.target.value})}
                placeholder="Ex: Salário, Freelance..."
                required
              />
            </div>
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={fonteForm.valor}
                onChange={(e) => setFonteForm({...fonteForm, valor: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={fonteForm.descricao}
                onChange={(e) => setFonteForm({...fonteForm, descricao: e.target.value})}
                placeholder="Detalhes adicionais..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ativa"
                checked={fonteForm.ativa}
                onCheckedChange={(checked) => setFonteForm({...fonteForm, ativa: checked})}
              />
              <Label htmlFor="ativa">Fonte ativa</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowFonteModal(false);
                setEditingFonte(null);
                resetFonteForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingFonte ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Cartão */}
      <Dialog open={showCartaoModal} onOpenChange={setShowCartaoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCartao ? 'Editar' : 'Novo'} Cartão</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingCartao ? handleUpdateCartao : handleAddCartao} className="space-y-4">
            <div>
              <Label htmlFor="apelido">Apelido</Label>
              <Input
                id="apelido"
                value={cartaoForm.apelido}
                onChange={(e) => setCartaoForm({...cartaoForm, apelido: e.target.value})}
                placeholder="Ex: Cartão Principal"
                required
              />
            </div>
            <div>
              <Label htmlFor="ultimos_digitos">Últimos 4 dígitos</Label>
              <Input
                id="ultimos_digitos"
                value={cartaoForm.ultimos_digitos}
                onChange={(e) => setCartaoForm({...cartaoForm, ultimos_digitos: e.target.value})}
                placeholder="1234"
                maxLength={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="limite">Limite</Label>
              <Input
                id="limite"
                type="number"
                step="0.01"
                value={cartaoForm.limite}
                onChange={(e) => setCartaoForm({...cartaoForm, limite: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <Label htmlFor="dia_vencimento">Dia do Vencimento</Label>
              <Select value={cartaoForm.dia_vencimento} onValueChange={(value) => setCartaoForm({...cartaoForm, dia_vencimento: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 31}, (_, i) => i + 1).map(dia => (
                    <SelectItem key={dia} value={dia.toString()}>{dia}</SelectItem>
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
              <Label htmlFor="ativo">Cartão ativo</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowCartaoModal(false);
                setEditingCartao(null);
                resetCartaoForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCartao ? 'Atualizar' : 'Adicionar'}
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
        onSubmit={async (data) => {
          try {
            if (editingContaParcelada) {
              await updateConta(editingContaParcelada.id, data as any);
              toast.success('Parcelamento atualizado com sucesso!');
            } else {
              await createConta(data);
              toast.success('Parcelamento criado com sucesso!');
            }
            return true;
          } catch (error) {
            toast.error('Erro ao salvar parcelamento');
            return false;
          }
        }}
        editingConta={editingContaParcelada}
      />

      {/* Modal Gasto Fixo */}
      <Dialog open={showGastoFixoModal} onOpenChange={setShowGastoFixoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGastoFixo ? 'Editar' : 'Novo'} Gasto Fixo</DialogTitle>
          </DialogHeader>
          <GastoFixoForm
            gastoFixo={editingGastoFixo}
            onSubmit={async (data) => {
              try {
                if (editingGastoFixo) {
                  await updateGastoFixo(editingGastoFixo.id, data as any);
                } else {
                  await createGastoFixo(data as any);
                }
                setShowGastoFixoModal(false);
                setEditingGastoFixo(null);
              } catch (error) {
                // Error handled in hook
              }
            }}
            onCancel={() => {
              setShowGastoFixoModal(false);
              setEditingGastoFixo(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};