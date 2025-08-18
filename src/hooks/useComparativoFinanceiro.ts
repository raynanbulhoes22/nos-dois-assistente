import { useMemo } from "react";
import { useMovimentacoes } from "./useMovimentacoes";
import { useFontesRenda } from "./useFontesRenda";
import { useGastosFixos } from "./useGastosFixos";
import { useContasParceladas } from "./useContasParceladas";
import { useFinancialCache } from "@/contexts/FinancialDataContext";

export interface ComparativoFinanceiro {
  rendaProjetada: number;
  rendaRealizada: number;
  gastosProjetados: number;
  gastosRealizados: number;
  saldoProjetado: number;
  saldoRealizado: number;
  taxaRealizacaoRenda: number; // %
  taxaControleGastos: number; // %
  economiaEfetiva: number;
}

export const useComparativoFinanceiro = (mes?: number, ano?: number) => {
  const { getFromCache, setCache } = useFinancialCache();
  const { entradas, saidas, isLoading: movimentacoesLoading } = useMovimentacoes();
  const { getTotalRendaAtiva, isLoading: fontesLoading } = useFontesRenda();
  const { getTotalGastosFixosAtivos, isLoading: gastosLoading } = useGastosFixos();
  const { getTotalParcelasAtivas, isLoading: contasLoading } = useContasParceladas();

  const mesAtual = mes || new Date().getMonth() + 1;
  const anoAtual = ano || new Date().getFullYear();

  const comparativo = useMemo((): ComparativoFinanceiro => {
    // Check cache first
    const cacheKey = `comparativo_${mesAtual}_${anoAtual}`;
    const cachedData = getFromCache<ComparativoFinanceiro>(cacheKey);
    
    if (cachedData && !movimentacoesLoading && !fontesLoading && !gastosLoading && !contasLoading) {
      return cachedData;
    }

    // Filtrar movimentações do mês/ano específico
    const movimentacoesMes = [...entradas, ...saidas].filter(mov => {
      const dataMovimentacao = new Date(mov.data);
      return dataMovimentacao.getMonth() + 1 === mesAtual && 
             dataMovimentacao.getFullYear() === anoAtual;
    });

    const entradasMes = movimentacoesMes.filter(mov => 
      entradas.some(entrada => entrada.id === mov.id)
    );
    const saidasMes = movimentacoesMes.filter(mov => 
      saidas.some(saida => saida.id === mov.id)
    );

    // Valores projetados
    const rendaProjetada = getTotalRendaAtiva();
    const gastosProjetados = getTotalGastosFixosAtivos() + getTotalParcelasAtivas();
    const saldoProjetado = rendaProjetada - gastosProjetados;

    // Valores realizados
    const rendaRealizada = entradasMes.reduce((total, entrada) => total + entrada.valor, 0);
    const gastosRealizados = saidasMes.reduce((total, saida) => total + saida.valor, 0);
    const saldoRealizado = rendaRealizada - gastosRealizados;

    // Cálculos de performance
    const taxaRealizacaoRenda = rendaProjetada > 0 ? (rendaRealizada / rendaProjetada) * 100 : 0;
    const taxaControleGastos = gastosProjetados > 0 ? (gastosRealizados / gastosProjetados) * 100 : 0;
    const economiaEfetiva = saldoRealizado - saldoProjetado;

    const result: ComparativoFinanceiro = {
      rendaProjetada,
      rendaRealizada,
      gastosProjetados,
      gastosRealizados,
      saldoProjetado,
      saldoRealizado,
      taxaRealizacaoRenda,
      taxaControleGastos,
      economiaEfetiva
    };

    // Cache the result
    if (!movimentacoesLoading && !fontesLoading && !gastosLoading && !contasLoading) {
      setCache(cacheKey, result, 90000); // Cache for 1.5 minutes
    }

    return result;
  }, [entradas, saidas, mesAtual, anoAtual, getTotalRendaAtiva, getTotalGastosFixosAtivos, getTotalParcelasAtivas, getFromCache, setCache, movimentacoesLoading, fontesLoading, gastosLoading, contasLoading]);

  const isLoading = movimentacoesLoading || fontesLoading || gastosLoading || contasLoading;

  return {
    comparativo,
    isLoading,
    mesAtual,
    anoAtual
  };
};