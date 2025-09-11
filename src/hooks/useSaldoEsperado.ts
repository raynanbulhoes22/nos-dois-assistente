import { useMemo } from "react";
import { useFontesRenda } from "./useFontesRenda";
import { useGastosFixos } from "./useGastosFixos";
import { useContasParceladas } from "./useContasParceladas";
import { useCartoes } from "./useCartoes";
import { safeNumber, logFinancialCalculation } from "@/lib/financial-utils";

export const useSaldoEsperado = (saldoInicial: number, mes?: number, ano?: number) => {
  const { getTotalRendaAtiva } = useFontesRenda();
  const { getTotalGastosFixosAtivos } = useGastosFixos();
  const { getTotalParcelasAtivas } = useContasParceladas();
  const { cartoes } = useCartoes();

  const saldoEsperado = useMemo(() => {
    const rendaMensal = safeNumber(getTotalRendaAtiva(), 0);
    const gastoFixoMensal = safeNumber(getTotalGastosFixosAtivos(), 0);
    const parcelasMensal = safeNumber(getTotalParcelasAtivas(), 0);
    const saldoInicialSafe = safeNumber(saldoInicial, 0);
    
    // Saldo Esperado = Saldo Inicial + Receitas - (Gastos fixos + Parcelas)
    const saldoProjetado = saldoInicialSafe + rendaMensal - (gastoFixoMensal + parcelasMensal);
    const variacao = saldoProjetado - saldoInicialSafe;
    const percentualVariacao = saldoInicialSafe !== 0 ? 
      ((saldoProjetado - saldoInicialSafe) / Math.abs(saldoInicialSafe)) * 100 : 0;
    
    const result = {
      saldoProjetado,
      rendaMensal,
      gastoFixoMensal,
      parcelasMensal,
      totalSaidas: gastoFixoMensal + parcelasMensal,
      variacao,
      percentualVariacao: safeNumber(percentualVariacao, 0)
    };

    logFinancialCalculation('useSaldoEsperado', {
      saldoInicial: saldoInicialSafe,
      rendaMensal,
      gastoFixoMensal,
      parcelasMensal
    }, result);

    return result;
  }, [saldoInicial, getTotalRendaAtiva, getTotalGastosFixosAtivos, getTotalParcelasAtivas, cartoes]);

  return saldoEsperado;
};