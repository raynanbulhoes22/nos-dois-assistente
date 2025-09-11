import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useContasParceladas } from "@/hooks/useContasParceladas";
import { useGastosFixos } from "@/hooks/useGastosFixos";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useFinancialCache } from "@/hooks/useFinancialCache";
import { calcularSaldoMes } from "@/lib/saldo-calculation";
import { safeNumber, formatCurrencySafe, getCurrentPeriod } from "@/lib/financial-utils";
import type { FinancialPeriod } from "@/types/financial";

interface OrcamentoData {
  // Dados básicos do período
  mesAtual: number;
  anoAtual: number;
  
  // Fontes de renda
  fontesRenda: any[];
  totalRendaAtiva: number;
  totalRendaRecebida: number;
  totalRendaPendente: number;
  
  // Gastos (unificados)
  gastosFixos: any[];
  contasParceladas: any[];
  gastosUnificados: any[]; // Todos os gastos em uma lista
  totalGastosAtivos: number;
  totalGastosPagos: number;
  totalGastosPendentes: number;
  
  // Saldos e projeções
  saldoInicial: number;
  saldoAtual: number;
  saldoProjetado: number;
  
  // Timeline simplificada
  timelineMeses: any[];
  
  // Estados
  isLoading: boolean;
  error: string | null;
}

export const useOrcamentoUnificado = (mes?: number, ano?: number) => {
  const { user } = useAuth();
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  
  // Usar período atual se não especificado
  const currentPeriod = getCurrentPeriod();
  const mesAtual = mes || currentPeriod.mes;
  const anoAtual = ano || currentPeriod.ano;
  
  // Estados unificados
  const [data, setData] = useState<OrcamentoData>({
    mesAtual,
    anoAtual,
    fontesRenda: [],
    totalRendaAtiva: 0,
    totalRendaRecebida: 0,
    totalRendaPendente: 0,
    gastosFixos: [],
    contasParceladas: [],
    gastosUnificados: [],
    totalGastosAtivos: 0,
    totalGastosPagos: 0,
    totalGastosPendentes: 0,
    saldoInicial: 0,
    saldoAtual: 0,
    saldoProjetado: 0,
    timelineMeses: [],
    isLoading: true,
    error: null
  });
  
  // Hooks individuais (mantemos para compatibilidade, mas simplificamos)
  const { 
    fontes, 
    getTotalRendaAtiva, 
    getFontesRendaComStatus,
    addFonte,
    updateFonte,
    deleteFonte,
    updateStatusManual,
    isLoading: fontesLoading 
  } = useFontesRenda();
  
  const { 
    contas, 
    getTotalParcelasAtivas,
    getContasParceladasComStatus,
    createConta,
    updateConta,
    deleteConta,
    updateStatusManualParcela,
    isLoading: contasLoading 
  } = useContasParceladas();
  
  const { 
    gastosFixos, 
    getTotalGastosFixosAtivos,
    getGastosFixosComStatus,
    createGastoFixo,
    updateGastoFixo,
    deleteGastoFixo,
    updateStatusManualGastoFixo,
    isLoading: gastosLoading 
  } = useGastosFixos();
  
  const { 
    orcamentos,
    getOrcamentoByMesAno,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    isLoading: orcamentosLoading 
  } = useOrcamentos();

  // Cache key para o período específico
  const cacheKey = `orcamento_unificado_${user?.id}_${mesAtual}_${anoAtual}`;
  
  // Função principal para calcular todos os dados
  const calcularDadosUnificados = useMemo(() => {
    return async () => {
      if (!user) return;
      
      try {
        // Verificar cache primeiro
        const cachedData = getFromCache<Partial<OrcamentoData>>(cacheKey);
        if (cachedData && !fontesLoading && !contasLoading && !gastosLoading) {
          setData(prev => ({ ...prev, ...cachedData, isLoading: false }));
          return;
        }
        
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // 1. Buscar dados com status para o período específico
        const [fontesComStatus, gastosComStatus, contasComStatus] = await Promise.all([
          getFontesRendaComStatus(mesAtual, anoAtual),
          getGastosFixosComStatus(mesAtual, anoAtual),
          getContasParceladasComStatus(mesAtual, anoAtual)
        ]);
        
        // 2. Calcular totais de renda
        const totalRendaAtiva = safeNumber(getTotalRendaAtiva(), 0);
        const totalRendaRecebida = fontesComStatus
          .filter(f => f.recebido)
          .reduce((sum, f) => sum + safeNumber(f.valor, 0), 0);
        const totalRendaPendente = fontesComStatus
          .filter(f => !f.recebido && f.ativa)
          .reduce((sum, f) => sum + safeNumber(f.valor, 0), 0);
        
        // 3. Unificar gastos (fixos + parcelas) com tipo identificador
        const gastosUnificados = [
          ...gastosComStatus.map(g => ({ 
            ...g, 
            tipoGasto: 'fixo' as const,
            valor_mensal: safeNumber(g.valor_mensal || g.valor, 0)
          })),
          ...contasComStatus.map(c => ({ 
            ...c, 
            tipoGasto: 'parcela' as const,
            valor_mensal: safeNumber(c.valor_parcela, 0),
            nome: c.nome,
            pago: c.pago
          }))
        ];
        
        // 4. Calcular totais de gastos
        const totalGastosAtivos = safeNumber(getTotalGastosFixosAtivos(), 0) + safeNumber(getTotalParcelasAtivas(), 0);
        const totalGastosPagos = gastosUnificados
          .filter(g => g.pago)
          .reduce((sum, g) => sum + g.valor_mensal, 0);
        const totalGastosPendentes = gastosUnificados
          .filter(g => !g.pago)
          .reduce((sum, g) => sum + g.valor_mensal, 0);
        
        // 5. Calcular saldos usando função centralizada
        const saldoCalculation = await calcularSaldoMes(user.id, { mes: mesAtual, ano: anoAtual });
        const saldoInicial = safeNumber(saldoCalculation.saldoInicial, 0);
        const saldoAtual = safeNumber(saldoCalculation.saldoFinal, 0);
        const saldoProjetado = saldoInicial + totalRendaAtiva - totalGastosAtivos;
        
        // 6. Gerar timeline simplificada (apenas 6 meses: 3 passados + atual + 2 futuros)
        const timelineMeses = [];
        for (let i = -3; i <= 2; i++) {
          const dataTimeline = new Date(anoAtual, mesAtual - 1 + i, 1);
          const mesTimeline = dataTimeline.getMonth() + 1;
          const anoTimeline = dataTimeline.getFullYear();
          
          let status: string;
          if (i < 0) {
            // Meses passados - usar dados reais quando possível
            status = saldoAtual > 0 ? 'positivo' : 'negativo';
          } else {
            // Mês atual e futuros - usar projeção
            const saldoProjetadoMes = saldoInicial + totalRendaAtiva - totalGastosAtivos;
            status = saldoProjetadoMes > totalRendaAtiva * 0.1 ? 'excelente' : 
                    saldoProjetadoMes > 0 ? 'positivo' : 'deficit';
          }
          
          timelineMeses.push({
            mes: mesTimeline,
            ano: anoTimeline,
            saldo: i <= 0 ? saldoAtual : saldoProjetado,
            status,
            isCurrent: i === 0
          });
        }
        
        const newData: Partial<OrcamentoData> = {
          mesAtual,
          anoAtual,
          fontesRenda: fontesComStatus,
          totalRendaAtiva,
          totalRendaRecebida,
          totalRendaPendente,
          gastosFixos: gastosComStatus,
          contasParceladas: contasComStatus,
          gastosUnificados,
          totalGastosAtivos,
          totalGastosPagos,
          totalGastosPendentes,
          saldoInicial,
          saldoAtual,
          saldoProjetado,
          timelineMeses,
          isLoading: false,
          error: null
        };
        
        setData(prev => ({ ...prev, ...newData }));
        
        // Cache por 5 minutos
        setCache(cacheKey, newData, 5 * 60 * 1000);
        
      } catch (error) {
        console.error('Erro ao calcular dados unificados:', error);
        setData(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Erro ao carregar dados do orçamento' 
        }));
      }
    };
  }, [
    user?.id, 
    mesAtual, 
    anoAtual,
    fontesLoading,
    contasLoading, 
    gastosLoading,
    orcamentosLoading,
    fontes.length,
    contas.length,
    gastosFixos.length
  ]);
  
  // Executar cálculo quando dependências mudarem
  useEffect(() => {
    if (user && !fontesLoading && !contasLoading && !gastosLoading && !orcamentosLoading) {
      calcularDadosUnificados();
    }
  }, [calcularDadosUnificados, user]);
  
  // Função para invalidar cache e recalcular
  const refetch = () => {
    invalidateCache(cacheKey);
    calcularDadosUnificados();
  };
  
  // Funções auxiliares
  const formatCurrency = (valor: number) => formatCurrencySafe(valor);
  
  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };
  
  const navegarMes = (direction: 'anterior' | 'proximo') => {
    let novoMes = mesAtual;
    let novoAno = anoAtual;
    
    if (direction === 'anterior') {
      if (mesAtual === 1) {
        novoMes = 12;
        novoAno = anoAtual - 1;
      } else {
        novoMes = mesAtual - 1;
      }
    } else {
      if (mesAtual === 12) {
        novoMes = 1;
        novoAno = anoAtual + 1;
      } else {
        novoMes = mesAtual + 1;
      }
    }
    
    // Atualizar dados para o novo período
    setData(prev => ({ ...prev, mesAtual: novoMes, anoAtual: novoAno, isLoading: true }));
  };
  
  return {
    // Dados principais
    ...data,
    
    // Funções auxiliares
    formatCurrency,
    getMesNome,
    navegarMes,
    refetch,
    
    // Actions para fontes de renda
    addFonte,
    updateFonte,
    deleteFonte,
    updateStatusRenda: updateStatusManual,
    
    // Actions para gastos fixos  
    createGastoFixo,
    updateGastoFixo,
    deleteGastoFixo,
    updateStatusGastoFixo: updateStatusManualGastoFixo,
    
    // Actions para contas parceladas
    createConta,
    updateConta,
    deleteConta,
    updateStatusParcela: updateStatusManualParcela,
    
    // Actions para orçamentos
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    orcamentoAtual: getOrcamentoByMesAno(mesAtual, anoAtual)
  };
};