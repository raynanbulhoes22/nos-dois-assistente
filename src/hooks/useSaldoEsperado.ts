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
    
    // Calcular gastos estimados com cartões (usando limite usado como estimativa)
    const faturasMensal = cartoes.reduce((total, cartao) => {
      if (!cartao.ativo || !cartao.limite) return total;
      
      // Usar uma estimativa baseada no limite (pode ser ajustado posteriormente)
      const limiteNum = typeof cartao.limite === 'string' ? parseFloat(cartao.limite) : cartao.limite;
      const estimativaUso = limiteNum * 0.3; // Estimativa de 30% do limite usado
      
      return total + estimativaUso;
    }, 0);
    
    // Saldo Esperado = Saldo Inicial + Receitas - (Gastos fixos + Parcelas + Faturas)
    const saldoProjetado = saldoInicial + rendaMensal - (gastoFixoMensal + parcelasMensal + faturasMensal);
    
    return {
      saldoProjetado,
      rendaMensal,
      gastoFixoMensal,
      parcelasMensal,
      faturasMensal,
      totalSaidas: gastoFixoMensal + parcelasMensal + faturasMensal,
      variacao: saldoProjetado - saldoInicial,
      percentualVariacao: saldoInicial !== 0 ? ((saldoProjetado - saldoInicial) / Math.abs(saldoInicial)) * 100 : 0
    };
  }, [saldoInicial, getTotalRendaAtiva, getTotalGastosFixosAtivos, getTotalParcelasAtivas, cartoes]);

  return saldoEsperado;
};