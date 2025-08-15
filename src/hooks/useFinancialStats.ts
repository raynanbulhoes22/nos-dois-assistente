import { useState, useEffect } from "react";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useCartoes } from "@/hooks/useCartoes";
import { useAuth } from "@/hooks/useAuth";
import { useOrcamentos } from "@/hooks/useOrcamentos";
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
  const { movimentacoes, entradas, saidas } = useMovimentacoes();
  const { fontes, getTotalRendaAtiva } = useFontesRenda();
  const { cartoes, getTotalLimite } = useCartoes();
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfile(data);
    };
    
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const calcularStats = async () => {
      if (!movimentacoes.length && !fontes.length && !user) return;

      // Garantir que existe saldo inicial para o mês atual
      if (user) {
        await garantirSaldoInicialMesAtual(user.id);
      }

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Calcular entradas e saídas do mês atual
    const entradasMes = entradas.filter(entrada => 
      new Date(entrada.data) >= inicioMes
    ).reduce((total, entrada) => total + entrada.valor, 0);
    
    const saidasMes = saidas.filter(saida => 
      new Date(saida.data) >= inicioMes
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
    
    // Buscar saldo inicial do orçamento atual
    const orcamentoAtual = getOrcamentoAtual();
    const saldoInicial = orcamentoAtual?.saldo_inicial || 0;
    
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

    setStats({
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
    });
    };
    
    calcularStats();
  }, [movimentacoes, entradas, saidas, fontes, cartoes, profile, user, getTotalRendaAtiva, getTotalLimite, getOrcamentoAtual]);

  return stats;
};