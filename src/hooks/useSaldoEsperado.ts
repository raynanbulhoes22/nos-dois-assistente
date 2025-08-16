import { useMemo } from "react";
import { useFontesRenda } from "./useFontesRenda";
import { useGastosFixos } from "./useGastosFixos";
import { useContasParceladas } from "./useContasParceladas";

export const useSaldoEsperado = (saldoAtual: number, mesesProjetados: number = 6) => {
  const { getTotalRendaAtiva } = useFontesRenda();
  const { getTotalGastosFixosAtivos } = useGastosFixos();
  const { calcularParcelasProjetadas } = useContasParceladas();

  const saldoEsperado = useMemo(() => {
    const rendaMensal = getTotalRendaAtiva();
    const gastoFixoMensal = getTotalGastosFixosAtivos();
    const parcelasProjetadas = calcularParcelasProjetadas(mesesProjetados);
    
    // Calcular saldo projetado mês a mês
    let saldoAtualIteracao = saldoAtual;
    
    for (let i = 0; i < mesesProjetados; i++) {
      // Encontrar parcelas para este mês específico
      const parcelasMes = parcelasProjetadas[i]?.valor || 0;
      
      // Fluxo líquido do mês = Renda - Gastos Fixos - Parcelas do mês
      const fluxoLiquidoMes = rendaMensal - gastoFixoMensal - parcelasMes;
      
      // Saldo no final do mês = Saldo início do mês + Fluxo líquido
      saldoAtualIteracao += fluxoLiquidoMes;
    }
    
    const saldoProjetado = saldoAtualIteracao;
    
    // Calcular média mensal das parcelas para exibição
    const totalParcelas = parcelasProjetadas.reduce((total, mes) => total + mes.valor, 0);
    const parcelasMensal = mesesProjetados > 0 ? totalParcelas / mesesProjetados : 0;
    
    // Fluxo líquido médio mensal
    const fluxoLiquidoMensal = rendaMensal - gastoFixoMensal - parcelasMensal;
    
    return {
      saldoProjetado,
      fluxoLiquidoMensal,
      rendaMensal,
      gastoFixoMensal,
      parcelasMensal,
      variacao: saldoProjetado - saldoAtual,
      percentualVariacao: saldoAtual !== 0 ? ((saldoProjetado - saldoAtual) / Math.abs(saldoAtual)) * 100 : 0
    };
  }, [saldoAtual, mesesProjetados, getTotalRendaAtiva, getTotalGastosFixosAtivos, calcularParcelasProjetadas]);

  return saldoEsperado;
};