import { useMemo } from "react";
import { useMovimentacoes } from "./useMovimentacoes";
import { useFontesRenda } from "./useFontesRenda";
import { useGastosFixos } from "./useGastosFixos";
import { useContasParceladas } from "./useContasParceladas";

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
  const { entradas, saidas, isLoading: movimentacoesLoading } = useMovimentacoes();
  const { getTotalRendaAtiva, isLoading: fontesLoading } = useFontesRenda();
  const { getTotalGastosFixosAtivos, isLoading: gastosLoading } = useGastosFixos();
  const { getTotalParcelasAtivas, isLoading: contasLoading } = useContasParceladas();

  const mesAtual = mes || new Date().getMonth() + 1;
  const anoAtual = ano || new Date().getFullYear();

  const comparativo = useMemo((): ComparativoFinanceiro => {
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

    return {
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
  }, [entradas, saidas, mesAtual, anoAtual, getTotalRendaAtiva, getTotalGastosFixosAtivos, getTotalParcelasAtivas]);

  const isLoading = movimentacoesLoading || fontesLoading || gastosLoading || contasLoading;

  return {
    comparativo,
    isLoading,
    mesAtual,
    anoAtual
  };
};