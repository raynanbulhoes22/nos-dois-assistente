import { useState, useEffect, useMemo } from "react";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useCartoes } from "@/hooks/useCartoes";
import { useAuth } from "@/hooks/useAuth";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useFinancialCache } from "@/contexts/FinancialDataContext";
import { supabase } from "@/integrations/supabase/client";
import { garantirSaldoInicialMesAtual } from "@/lib/saldo-utils";

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

  // Memoized stats calculation
  const calculatedStats = useMemo(async () => {
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

      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      
      // Buscar saldo inicial dos registros financeiros (fonte da verdade)
      const { data: registroSaldo } = await supabase
        .from('registros_financeiros')
        .select('valor, tipo_movimento')
        .eq('user_id', user.id)
        .eq('categoria', 'Saldo Inicial')
        .gte('data', inicioMes.toISOString().split('T')[0])
        .lte('data', ultimoDiaMes.toISOString().split('T')[0])
        .maybeSingle();
      
      const saldoInicial = registroSaldo 
        ? (registroSaldo.tipo_movimento === 'entrada' ? registroSaldo.valor : -registroSaldo.valor)
        : 0;
    
      // Calcular entradas e saídas do mês atual (excluindo saldo inicial)
      const entradasMes = entradas.filter(entrada => 
        new Date(entrada.data) >= inicioMes && entrada.categoria !== 'Saldo Inicial'
      ).reduce((total, entrada) => total + entrada.valor, 0);
      
      const saidasMes = saidas.filter(saida => 
        new Date(saida.data) >= inicioMes && saida.categoria !== 'Saldo Inicial'
      ).reduce((total, saida) => total + saida.valor, 0);

      // Separar transações por origem
      const transacoesWpp = movimentacoes.filter(mov => mov.numero_wpp).length;
      const transacoesManuais = movimentacoes.filter(mov => !mov.numero_wpp).length;

      // Calcular uso de cartão (aproximação baseada em transações)
      const gastosCartao = saidas.filter(saida => 
        saida.forma_pagamento?.toLowerCase().includes('cartão') ||
        saida.forma_pagamento?.toLowerCase().includes('credito')
      ).reduce((total, saida) => total + saida.valor, 0);

      const rendaRegistrada = getTotalRendaAtiva();
      const saldoMovimentacoesMes = entradasMes - saidasMes;
      
      // Saldo computado = saldo inicial + movimentações do mês
      const saldoComputado = saldoInicial + saldoMovimentacoesMes;
    
      const metaEconomia = profile?.meta_economia_mensal || 0;
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

      const limiteTotal = getTotalLimite();
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
    isLoadingProfile,
    getFromCache,
    setCache
  ]);

  useEffect(() => {
    const updateStats = async () => {
      const newStats = await calculatedStats;
      if (newStats) {
        setStats(newStats);
      }
    };
    
    updateStats();
  }, [calculatedStats]);

  return stats;
};