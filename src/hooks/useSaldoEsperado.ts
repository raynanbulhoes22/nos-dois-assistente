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
    
    // Calcular média mensal das parcelas projetadas
    const totalParcelas = parcelasProjetadas.reduce((total, mes) => total + mes.valor, 0);
    const parcelasMensal = mesesProjetados > 0 ? totalParcelas / mesesProjetados : 0;
    
    // Fluxo líquido mensal = Renda - Gastos Fixos - Parcelas
    const fluxoLiquidoMensal = rendaMensal - gastoFixoMensal - parcelasMensal;
    
    // Saldo esperado = Saldo atual + (Fluxo líquido × Meses projetados)
    const saldoProjetado = saldoAtual + (fluxoLiquidoMensal * mesesProjetados);
    
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