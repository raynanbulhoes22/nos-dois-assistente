import { useState, useEffect, useMemo } from "react";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useCartoes } from "@/hooks/useCartoes";
import { useAuth } from "@/hooks/useAuth";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useFinancialCache } from "@/hooks/useFinancialCache";
import { supabase } from "@/integrations/supabase/client";
import { garantirSaldoInicialMesAtual } from "@/lib/saldo-utils";
import { safeNumber, logFinancialCalculation, getCurrentPeriod } from "@/lib/financial-utils";

export interface FinancialStats {
  rendaRegistrada: number;
  rendaReal: number;
  gastosEsteMes: number;
  saldoAtual: number;
  saldoInicial: number;
  saldoComputado: number;
  percentualMetaEconomia: number;
  limiteCartaoTotal: number;
  limiteCartaoUsado: number;
  transacoesWhatsApp: number;
  transacoesManuais: number;
  metaEconomia?: number;
  alertas: Alert[];
}

export interface Alert {
  id: string;
  tipo: 'sucesso' | 'alerta' | 'perigo';
  titulo: string;
  mensagem: string;
  acao?: string;
}

export const useFinancialStats = () => {
  const { user } = useAuth();
  const { getFromCache, setCache } = useFinancialCache();
  const { movimentacoes, entradas, saidas, isLoading: movLoading } = useMovimentacoes();
  const { fontes, getTotalRendaAtiva, isLoading: fontesLoading } = useFontesRenda();
  const { cartoes, getTotalLimite, isLoading: cartoesLoading } = useCartoes();
  const { getOrcamentoAtual } = useOrcamentos();
  
  const [stats, setStats] = useState<FinancialStats>({
    rendaRegistrada: 0,
    rendaReal: 0,
    gastosEsteMes: 0,
    saldoAtual: 0,
    saldoInicial: 0,
    saldoComputado: 0,
    percentualMetaEconomia: 0,
    limiteCartaoTotal: 0,
    limiteCartaoUsado: 0,
    transacoesWhatsApp: 0,
    transacoesManuais: 0,
    alertas: []
  });
  
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Cache profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }
      
      const cacheKey = `profile_${user.id}`;
      const cachedProfile = getFromCache<any>(cacheKey);
      
      if (cachedProfile) {
        setProfile(cachedProfile);
        setIsLoadingProfile(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        setProfile(data);
        if (data) {
          setCache(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [user, getFromCache, setCache]);

  // Async function to calculate stats
  const calculateStats = async (): Promise<FinancialStats | null> => {
    if (!user || movLoading || fontesLoading || cartoesLoading || isLoadingProfile) {
      return null;
    }

    const cacheKey = `financial_stats_${user.id}`;
    const cachedStats = getFromCache<FinancialStats>(cacheKey);
    
    if (cachedStats) {
      return cachedStats;
    }

    try {
      // Garantir que existe saldo inicial para o mês atual
      await garantirSaldoInicialMesAtual(user.id);

      const currentPeriod = getCurrentPeriod();
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      console.log('🔍 useFinancialStats - Calculando stats para:', {
        mes: hoje.getMonth() + 1,
        ano: hoje.getFullYear(),
        inicioMes
      });
      
      // Buscar saldo inicial do orçamento mensal (fonte da verdade)
      const { data: orcamentoMensal } = await supabase
        .from('orcamentos_mensais')
        .select('saldo_inicial')
        .eq('user_id', user.id)
        .eq('mes', currentPeriod.mes)
        .eq('ano', currentPeriod.ano)
        .maybeSingle();
      
      const saldoInicial = safeNumber(orcamentoMensal?.saldo_inicial, 0);
      console.log('💰 Saldo inicial encontrado:', saldoInicial);
    
      // Calcular entradas e saídas do mês atual (excluindo saldo inicial)
      const entradasMes = entradas.filter(entrada => {
        const dataEntrada = new Date(entrada.data);
        return dataEntrada >= inicioMes && 
               dataEntrada.getMonth() === hoje.getMonth() &&
               dataEntrada.getFullYear() === hoje.getFullYear() &&
               entrada.categoria !== 'Saldo Inicial';
      }).reduce((total, entrada) => total + safeNumber(entrada.valor, 0), 0);
      
      const saidasMes = saidas.filter(saida => {
        const dataSaida = new Date(saida.data);
        return dataSaida >= inicioMes && 
               dataSaida.getMonth() === hoje.getMonth() &&
               dataSaida.getFullYear() === hoje.getFullYear() &&
               saida.categoria !== 'Saldo Inicial';
      }).reduce((total, saida) => total + safeNumber(saida.valor, 0), 0);

      console.log('📊 Movimentações do mês:', {
        entradas: entradasMes,
        saidas: saidasMes,
        saldo: entradasMes - saidasMes
      });

      // Separar transações por origem do mês atual
      const movimentacoesMes = movimentacoes.filter(mov => {
        const dataMovimentacao = new Date(mov.data);
        return dataMovimentacao >= inicioMes && 
               dataMovimentacao.getMonth() === hoje.getMonth() &&
               dataMovimentacao.getFullYear() === hoje.getFullYear();
      });
      
      const transacoesWpp = movimentacoesMes.filter(mov => mov.numero_wpp).length;
      const transacoesManuais = movimentacoesMes.filter(mov => !mov.numero_wpp).length;

      // Calcular uso de cartão (aproximação baseada em transações)
      const gastosCartao = saidasMes;

      const rendaRegistrada = safeNumber(getTotalRendaAtiva(), 0);
      const saldoMovimentacoesMes = entradasMes - saidasMes;
      
      // Saldo computado = saldo inicial + movimentações do mês
      const saldoComputado = saldoInicial + saldoMovimentacoesMes;
      
      logFinancialCalculation('useFinancialStats - calculate', {
        saldoInicial,
        entradasMes,
        saidasMes,
        saldoMovimentacoesMes,
        saldoComputado,
        rendaRegistrada
      });
      
      console.log('🎯 Resultado dos cálculos:', {
        rendaRegistrada,
        saldoInicial,
        saldoMovimentacoesMes,
        saldoComputado,
        transacoesWpp,
        transacoesManuais
      });
    
      const metaEconomia = safeNumber(profile?.meta_economia_mensal, 0);
      const percentualMeta = metaEconomia > 0 ? (saldoComputado / metaEconomia) * 100 : 0;

      // Gerar alertas inteligentes
      const alertas: Alert[] = [];

      if (percentualMeta >= 100) {
        alertas.push({
          id: '1',
          tipo: 'sucesso',
          titulo: '🎉 Meta alcançada!',
          mensagem: `Você já atingiu ${percentualMeta.toFixed(1)}% da sua meta de economia mensal!`,
          acao: 'Ver detalhes'
        });
      } else if (percentualMeta >= 80) {
        alertas.push({
          id: '2',
          tipo: 'alerta',
          titulo: '⚡ Quase lá!',
          mensagem: `Você está em ${percentualMeta.toFixed(1)}% da sua meta de economia.`,
          acao: 'Ajustar gastos'
        });
      } else if (saldoComputado < 0) {
        alertas.push({
          id: '3',
          tipo: 'perigo',
          titulo: '⚠️ Saldo negativo',
          mensagem: 'Seu saldo atual está negativo. Considere revisar seus gastos.',
          acao: 'Revisar orçamento'
        });
      }

      if (rendaRegistrada > 0 && entradasMes < rendaRegistrada * 0.8) {
        alertas.push({
          id: '4',
          tipo: 'alerta',
          titulo: '📊 Renda abaixo do esperado',
          mensagem: `Sua renda real está ${((entradasMes / rendaRegistrada) * 100).toFixed(1)}% da renda registrada.`,
          acao: 'Verificar fontes'
        });
      }

      const limiteTotal = safeNumber(getTotalLimite(), 0);
      if (limiteTotal > 0 && gastosCartao > limiteTotal * 0.8) {
        alertas.push({
          id: '5',
          tipo: 'perigo',
          titulo: '💳 Limite do cartão',
          mensagem: `Você já usou ${((gastosCartao / limiteTotal) * 100).toFixed(1)}% do limite total dos cartões.`,
          acao: 'Controlar gastos'
        });
      }

      const calculatedStats: FinancialStats = {
        rendaRegistrada,
        rendaReal: entradasMes,
        gastosEsteMes: saidasMes,
        saldoAtual: saldoMovimentacoesMes,
        saldoInicial,
        saldoComputado,
        percentualMetaEconomia: percentualMeta,
        limiteCartaoTotal: limiteTotal,
        limiteCartaoUsado: gastosCartao,
        transacoesWhatsApp: transacoesWpp,
        transacoesManuais,
        metaEconomia,
        alertas
      };

      // Cache the results
      setCache(cacheKey, calculatedStats, 2 * 60 * 1000); // Cache for 2 minutes
      
      return calculatedStats;
    } catch (error) {
      console.error('Error calculating financial stats:', error);
      return null;
    }
  };

  useEffect(() => {
    const updateStats = async () => {
      const newStats = await calculateStats();
      if (newStats) {
        setStats(newStats);
      }
    };
    
    updateStats();
  }, [
    user, 
    movimentacoes, 
    entradas, 
    saidas, 
    fontes, 
    cartoes, 
    profile, 
    getTotalRendaAtiva, 
    getTotalLimite,
    movLoading,
    fontesLoading,
    cartoesLoading,
    isLoadingProfile
  ]);

  return stats;
};