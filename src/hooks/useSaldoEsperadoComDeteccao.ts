import { useState, useEffect, useMemo } from "react";
import { useFontesRenda } from "./useFontesRenda";
import { useGastosFixos } from "./useGastosFixos";
import { useContasParceladas } from "./useContasParceladas";
import { useCartoes } from "./useCartoes";

export const useSaldoEsperadoComDeteccao = (saldoInicial: number, mes: number, ano: number) => {
  const { getTotalRendaAtiva } = useFontesRenda();
  const { getTotalGastosFixosNaoPagos, getTotalGastosFixosAtivos } = useGastosFixos();
  const { getTotalParcelasAtivas } = useContasParceladas();
  const { cartoes } = useCartoes();
  
  const [gastosFixosNaoPagos, setGastosFixosNaoPagos] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarGastosNaoPagos = async () => {
      setIsLoading(true);
      try {
        const total = await getTotalGastosFixosNaoPagos(mes, ano);
        setGastosFixosNaoPagos(total);
      } catch (error) {
        console.error('Erro ao carregar gastos não pagos:', error);
        // Fallback para o total geral
        setGastosFixosNaoPagos(getTotalGastosFixosAtivos());
      } finally {
        setIsLoading(false);
      }
    };

    carregarGastosNaoPagos();
  }, [getTotalGastosFixosNaoPagos, getTotalGastosFixosAtivos, mes, ano]);

  const saldoEsperado = useMemo(() => {
    const rendaMensal = getTotalRendaAtiva();
    const parcelasMensal = getTotalParcelasAtivas();
    
    // Saldo Esperado = Saldo Inicial + Receitas - (Gastos fixos não pagos + Parcelas)
    const saldoProjetado = saldoInicial + rendaMensal - (gastosFixosNaoPagos + parcelasMensal);
    
    return {
      saldoProjetado,
      rendaMensal,
      gastoFixoMensal: gastosFixosNaoPagos,
      gastoFixoTotal: getTotalGastosFixosAtivos(),
      parcelasMensal,
      totalSaidas: gastosFixosNaoPagos + parcelasMensal,
      variacao: saldoProjetado - saldoInicial,
      percentualVariacao: saldoInicial !== 0 ? ((saldoProjetado - saldoInicial) / Math.abs(saldoInicial)) * 100 : 0,
      gastosJaPagos: getTotalGastosFixosAtivos() - gastosFixosNaoPagos,
      isLoading
    };
  }, [saldoInicial, getTotalRendaAtiva, gastosFixosNaoPagos, getTotalGastosFixosAtivos, getTotalParcelasAtivas, cartoes, isLoading]);

  return saldoEsperado;
};