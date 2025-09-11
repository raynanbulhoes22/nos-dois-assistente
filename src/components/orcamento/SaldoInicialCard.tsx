import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Edit2, TrendingUp, TrendingDown, Plus, AlertCircle, Minus, Target, Clock, DollarSign, Info } from 'lucide-react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useAuth } from '@/hooks/useAuth';
import { useSaldoInicial } from "@/hooks/useSaldoInicial";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useGastosFixos } from "@/hooks/useGastosFixos";
import { useContasParceladas } from "@/hooks/useContasParceladas";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useCompromissosFinanceiros } from "@/hooks/useCompromissosFinanceiros";
import { supabase } from '@/integrations/supabase/client';
import { recalcularSaldosEmCascata } from "@/lib/saldo-utils";
import { useToast } from '@/hooks/use-toast';
import { CardDetailModal } from "./CardDetailModal";
import { calcularSaldoMes } from "@/lib/saldo-calculation";
import { safeNumber, formatCurrencySafe } from "@/lib/financial-utils";
import type { FinancialPeriod } from "@/types/financial";

interface SaldoInicialCardProps {
  mes: number;
  ano: number;
}

export const SaldoInicialCard = ({ mes, ano }: SaldoInicialCardProps) => {
  const { user } = useAuth();
  const { getOrcamentoByMesAno, updateOrcamento, createOrcamento, refetch } = useOrcamentos();
  const { toast } = useToast();
  
  // Hook para garantir continuidade automática dos saldos
  useSaldoInicial(mes, ano);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [novoSaldo, setNovoSaldo] = useState('');
  const [saldoInicialFromDB, setSaldoInicialFromDB] = useState<number>(0);
  const [saldoAtualComputado, setSaldoAtualComputado] = useState<number>(0);
  const [activeDetailModal, setActiveDetailModal] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Hooks para dados dos modais - com period filtering
  const { movimentacoes } = useMovimentacoes();
  const { fontes, getTotalRendaAtiva } = useFontesRenda();
  const { gastosFixos, getTotalGastosFixosAtivos } = useGastosFixos();
  const { contas, getTotalParcelasAtivas } = useContasParceladas();
  const { compromissos } = useCompromissosFinanceiros();
  
  // Criar período financeiro
  const period: FinancialPeriod = { mes, ano };

  const orcamento = getOrcamentoByMesAno(mes, ano);
  // Usar o saldo dos registros financeiros em vez do orçamento
  const saldoInicialAtual = saldoInicialFromDB;

  // Buscar saldo inicial do orçamento mensal
  useEffect(() => {
    const buscarSaldoInicial = async () => {
      if (!user) return;

      const { data: orcamento, error } = await supabase
        .from('orcamentos_mensais')
        .select('saldo_inicial')
        .eq('user_id', user.id)
        .eq('mes', mes)
        .eq('ano', ano)
        .maybeSingle();
      
      if (!error && orcamento) {
        setSaldoInicialFromDB(orcamento.saldo_inicial || 0);
      } else {
        setSaldoInicialFromDB(0);
      }
    };
    
    buscarSaldoInicial();
  }, [user, mes, ano]);

  // Calcular saldo atual usando a função centralizada
  useEffect(() => {
    const calcularSaldoAtual = async () => {
      if (!user || isCalculating) return;
      
      setIsCalculating(true);
      try {
        const saldoCalculation = await calcularSaldoMes(user.id, period);
        setSaldoAtualComputado(safeNumber(saldoCalculation.saldoFinal, 0));
      } catch (error) {
        console.error('Erro ao calcular saldo atual:', error);
        setSaldoAtualComputado(0);
      } finally {
        setIsCalculating(false);
      }
    };
    
    calcularSaldoAtual();
  }, [user, mes, ano, saldoInicialFromDB, period, isCalculating]);
  
  const formatCurrency = (value: number) => {
    return formatCurrencySafe(value);
  };

  const getStatusBadge = (valor: number) => {
    if (valor >= saldoInicialFromDB * 1.3) return { variant: "default" as const, text: "Excelente", class: "bg-success text-white" };
    if (valor >= saldoInicialFromDB * 1.1) return { variant: "secondary" as const, text: "Bom", class: "bg-accent text-white" };
    if (valor >= saldoInicialFromDB * 0.9) return { variant: "outline" as const, text: "Estável", class: "bg-info text-white" };
    if (valor >= 0) return { variant: "destructive" as const, text: "Atenção", class: "bg-warning text-white" };
    return { variant: "destructive" as const, text: "Crítico", class: "bg-error text-white" };
  };

  const handleEditSaldo = () => {
    setNovoSaldo(saldoInicialAtual.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveSaldo = async () => {
    if (!user) {
      toast({
        title: "❌ Erro",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('🔄 Iniciando atualização do saldo inicial...', { user: user.id, mes, ano, novoSaldo });
    
    try {
      const valorSaldo = parseFloat(novoSaldo.replace(',', '.')) || 0;
      console.log('💰 Valor processado:', valorSaldo);
      
      // 1. Atualizar/criar orçamento e marcar como editado manualmente
      console.log('📊 Atualizando orçamento...', { orcamento: orcamento?.id });
      if (orcamento) {
        const result = await updateOrcamento(orcamento.id, { 
          saldo_inicial: valorSaldo,
          saldo_editado_manualmente: true 
        });
        console.log('✅ Orçamento atualizado:', result);
      } else {
        const result = await createOrcamento({
          mes,
          ano,
          saldo_inicial: valorSaldo,
          meta_economia: 0,
          saldo_editado_manualmente: true
        });
        console.log('✅ Orçamento criado:', result);
      }
      
      // Não mais necessário gerenciar registros de "Saldo Inicial"
      // O saldo inicial é mantido apenas em orcamentos_mensais.saldo_inicial
      
      // 4. Atualizar estado local imediatamente
      setSaldoInicialFromDB(valorSaldo);
      
      // 5. Recalcular saldos dos meses futuros em cascata
      console.log('🔄 Iniciando recálculo em cascata...');
      await recalcularSaldosEmCascata(user.id, mes, ano);
      console.log('✅ Recálculo em cascata concluído');
      
      // 6. Recarregar dados do orçamento
      await refetch();
      
      toast({
        title: "✅ Sucesso!",
        description: "Saldo inicial atualizado e meses futuros recalculados com sucesso!"
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar saldo inicial:', error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar saldo inicial",
        variant: "destructive"
      });
    }
  };

  // Calcular evolução corretamente baseado nos dados dos registros financeiros
  const evolucaoSaldo = safeNumber(saldoAtualComputado, 0) - safeNumber(saldoInicialFromDB, 0);
  const isPositiveEvolution = evolucaoSaldo >= 0;
  
  // Calcular porcentagem de evolução
  const evolucaoPercentual = saldoInicialFromDB !== 0 
    ? ((evolucaoSaldo / Math.abs(saldoInicialFromDB)) * 100)
    : 0;

  // Dados calculados com memoização
  const saldoEsperadoData = useMemo(() => {
    // Filtrar dados pelo período específico
    const fontesAtivas = fontes.filter(f => f.ativa);
    const gastosAtivos = gastosFixos.filter(g => g.ativo);
    const contasAtivas = contas.filter(c => {
      // Verificar se a parcela está ativa no período específico
      const dataInicio = new Date(c.data_primeira_parcela);
      const mesInicio = dataInicio.getMonth() + 1;
      const anoInicio = dataInicio.getFullYear();
      const mesesDecorridos = (ano - anoInicio) * 12 + (mes - mesInicio);
      const parcelaAtual = mesesDecorridos + 1;
      return parcelaAtual > 0 && parcelaAtual <= c.total_parcelas && parcelaAtual > c.parcelas_pagas;
    });

    const rendaMensal = fontesAtivas.reduce((total, f) => total + safeNumber(f.valor, 0), 0);
    const gastoFixoMensal = gastosAtivos.reduce((total, g) => total + safeNumber(g.valor_mensal, 0), 0);
    const parcelasMensal = contasAtivas.reduce((total, c) => total + safeNumber(c.valor_parcela, 0), 0);
    const totalSaidas = gastoFixoMensal + parcelasMensal;
    const saldoProjetado = safeNumber(saldoInicialFromDB, 0) + rendaMensal - totalSaidas;

    return {
      rendaMensal,
      gastoFixoMensal,
      parcelasMensal,
      totalSaidas,
      saldoProjetado,
      fontesAtivas,
      gastosAtivos,
      contasAtivas
    };
  }, [fontes, gastosFixos, contas, saldoInicialFromDB, mes, ano]);

  // Preparar dados para os modais
  const getSaldoAtualItems = () => {
    const currentMonthMovimentacoes = movimentacoes?.filter(mov => {
      const movDate = new Date(mov.data);
      return movDate.getMonth() === mes - 1 && movDate.getFullYear() === ano;
    }) || [];

    const entradas = currentMonthMovimentacoes
      .filter(mov => mov.isEntrada || mov.tipo_movimento === 'entrada')
      .reduce((total, mov) => total + safeNumber(mov.valor, 0), 0);
    
    const saidas = currentMonthMovimentacoes
      .filter(mov => !mov.isEntrada && mov.tipo_movimento !== 'entrada')
      .reduce((total, mov) => total + safeNumber(mov.valor, 0), 0);

    return [
      { label: "Saldo Inicial", value: safeNumber(saldoInicialFromDB, 0), type: "neutral" as const },
      { label: "Total de Entradas", value: safeNumber(entradas, 0), type: "positive" as const },
      { label: "Total de Saídas", value: safeNumber(saidas, 0), type: "negative" as const },
    ];
  };

  const getSaldoEsperadoItems = () => [
    { label: "Saldo Inicial", value: safeNumber(saldoInicialFromDB, 0), type: "neutral" as const },
    { label: "Receitas Fixas", value: safeNumber(saldoEsperadoData.rendaMensal, 0), type: "positive" as const },
    { label: "Gastos Fixos", value: safeNumber(saldoEsperadoData.gastoFixoMensal, 0), type: "negative" as const },
    { label: "Parcelas", value: safeNumber(saldoEsperadoData.parcelasMensal, 0), type: "negative" as const },
  ];

  const getSaidasEsperadasItems = () => {
    // Mostrar TODOS os gastos e parcelas, não apenas top N
    const allItems: Array<{ label: string; value: number; type: "negative" }> = [];
    
    // Adicionar todos os gastos fixos ativos
    saldoEsperadoData.gastosAtivos.forEach(g => {
      allItems.push({
        label: `${g.nome} (Gasto Fixo)`,
        value: safeNumber(g.valor_mensal, 0),
        type: "negative" as const
      });
    });
    
    // Adicionar todas as parcelas ativas no período
    saldoEsperadoData.contasAtivas.forEach(c => {
      const parcelaAtual = Math.floor((ano - new Date(c.data_primeira_parcela).getFullYear()) * 12 + 
                                   (mes - 1 - new Date(c.data_primeira_parcela).getMonth())) + 1;
      allItems.push({
        label: `${c.nome || c.descricao} (${parcelaAtual}/${c.total_parcelas})`,
        value: safeNumber(c.valor_parcela, 0),
        type: "negative" as const
      });
    });

    // Ordenar por valor (maiores primeiro)
    return allItems.sort((a, b) => b.value - a.value);
  };

  return (
    <TooltipProvider>
      {/* New Grid Layout with 4 Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
        {/* Card 1: Saldo Inicial */}
        <Card className="metric-card metric-card-primary group cursor-pointer" onClick={handleEditSaldo}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="icon-container icon-primary">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Saldo Inicial
                  </span>
                </div>
                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {formatCurrency(saldoInicialFromDB || 0)}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-help">
                      Clique para editar
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Defina o valor inicial do mês</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Saldo Atual */}
        <Card 
          className="metric-card metric-card-success cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setActiveDetailModal('saldo-atual')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="icon-container icon-success">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Saldo Atual
                </span>
                <Info className="h-3 w-3 text-muted-foreground ml-auto" />
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {formatCurrency(saldoAtualComputado || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Inicial + movimentações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Saldo Esperado */}
        <Card 
          className={`metric-card ${saldoEsperadoData.saldoProjetado >= saldoInicialFromDB ? 'metric-card-success' : 'metric-card-warning'} cursor-pointer hover:bg-muted/50 transition-colors`}
          onClick={() => setActiveDetailModal('saldo-esperado')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`icon-container ${saldoEsperadoData.saldoProjetado >= saldoInicialFromDB ? 'icon-success' : 'icon-warning'}`}>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Saldo Esperado
                </span>
                <Info className="h-3 w-3 text-muted-foreground ml-auto" />
              </div>
              <div className="space-y-1">
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  saldoEsperadoData.saldoProjetado >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {formatCurrency(saldoEsperadoData.saldoProjetado)}
                </p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    final do mês
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1 py-0 h-4 ${getStatusBadge(saldoEsperadoData.saldoProjetado).class}`}
                  >
                    {getStatusBadge(saldoEsperadoData.saldoProjetado).text}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Saídas Esperadas */}
        <Card 
          className="metric-card metric-card-warning cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setActiveDetailModal('saidas-esperadas')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="icon-container icon-warning">
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Saídas Esperadas
                </span>
                <Info className="h-3 w-3 text-muted-foreground ml-auto" />
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-warning">
                  {formatCurrency(saldoEsperadoData.totalSaidas)}
                </p>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    Fixos: {formatCurrency(saldoEsperadoData.gastoFixoMensal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Parcelas: {formatCurrency(saldoEsperadoData.parcelasMensal)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição - Mobile Optimized */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-sm mx-auto rounded-lg">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              {saldoInicialAtual === 0 ? 'Definir Saldo' : 'Editar Saldo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Explicação Mobile First */}
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Quanto você tinha na carteira?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Informe o valor total que você possuía no início de {mes}/{ano}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="saldo" className="text-sm font-medium">
                Saldo Inicial (R$)
              </Label>
              <Input
                id="saldo"
                type="text"
                placeholder="Ex: 1500,00"
                value={novoSaldo}
                onChange={(e) => setNovoSaldo(e.target.value)}
                className="text-center text-lg font-semibold h-12"
                autoFocus
              />
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 order-2 sm:order-1"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="w-full sm:flex-1 font-medium order-1 sm:order-2"
                onClick={handleSaveSaldo}
              >
                {saldoInicialAtual === 0 ? 'Definir' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals de Detalhes */}
      <CardDetailModal
        isOpen={activeDetailModal === 'saldo-atual'}
        onClose={() => setActiveDetailModal(null)}
        title="Saldo Atual"
        value={saldoAtualComputado}
        explanation="Saldo Inicial + Total de Entradas - Total de Saídas"
        items={getSaldoAtualItems()}
      />

      <CardDetailModal
        isOpen={activeDetailModal === 'saldo-esperado'}
        onClose={() => setActiveDetailModal(null)}
        title={`Saldo Esperado - ${mes}/${ano}`}
        value={saldoEsperadoData.saldoProjetado}
        explanation={`Projeção baseada em receitas e gastos fixos para ${mes}/${ano}`}
        items={getSaldoEsperadoItems()}
      />

      <CardDetailModal
        isOpen={activeDetailModal === 'saidas-esperadas'}
        onClose={() => setActiveDetailModal(null)}
        title={`Saídas Esperadas - ${mes}/${ano}`}
        value={saldoEsperadoData.totalSaidas}
        explanation={`Todos os compromissos fixos e parcelas previstas para ${mes}/${ano}`}
        items={getSaidasEsperadasItems()}
      />
    </TooltipProvider>
  );
};