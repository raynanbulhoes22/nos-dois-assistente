import { useMemo } from "react";
import { useFontesRenda } from "./useFontesRenda";
import { useGastosFixos } from "./useGastosFixos";
import { useContasParceladas } from "./useContasParceladas";
import { useCartoes } from "./useCartoes";

export const useSaldoEsperado = (saldoInicial: number) => {
  const { getTotalRendaAtiva } = useFontesRenda();
  const { getTotalGastosFixosAtivos } = useGastosFixos();
  const { getTotalParcelasAtivas } = useContasParceladas();
  const { cartoes } = useCartoes();

  const saldoEsperado = useMemo(() => {
    const rendaMensal = getTotalRendaAtiva();
    const gastoFixoMensal = getTotalGastosFixosAtivos();
    const parcelasMensal = getTotalParcelasAtivas();
    
    // Saldo Esperado = Saldo Inicial + Receitas - (Gastos fixos + Parcelas)
    const saldoProjetado = saldoInicial + rendaMensal - (gastoFixoMensal + parcelasMensal);
    
    return {
      saldoProjetado,
      rendaMensal,
      gastoFixoMensal,
      parcelasMensal,
      totalSaidas: gastoFixoMensal + parcelasMensal,
      variacao: saldoProjetado - saldoInicial,
      percentualVariacao: saldoInicial !== 0 ? ((saldoProjetado - saldoInicial) / Math.abs(saldoInicial)) * 100 : 0
    };
  }, [saldoInicial, getTotalRendaAtiva, getTotalGastosFixosAtivos, getTotalParcelasAtivas, cartoes]);

  return saldoEsperado;
};