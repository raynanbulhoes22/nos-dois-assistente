import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Cartao } from "@/hooks/useCartoes";

export interface TransacaoCartao {
  id: string;
  valor: number;
  data: string;
  cartao_final?: string;
  ultimos_digitos?: string;
  apelido?: string;
  titulo?: string;
  nome?: string;
  forma_pagamento?: string;
  estabelecimento?: string;
  tipo_movimento?: string;
  observacao?: string;
}

export interface LimiteDinamico {
  limiteTotal: number;
  limiteInicialDisponivel: number;
  limiteAtualDisponivel: number;
  limiteUtilizado: number;
  percentualUtilizado: number;
  comprasNoMes: number;
  pagamentosNoMes: number;
  transacoesCartao: TransacaoCartao[];
  diferenca: number;
}

export const useLimiteDinamicoCartao = (cartao: Cartao) => {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<TransacaoCartao[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Função para detectar se uma transação é pagamento de fatura
  const isPagamentoFatura = (transacao: TransacaoCartao): boolean => {
    const texto = `${transacao.titulo} ${transacao.nome} ${transacao.estabelecimento} ${transacao.observacao}`.toLowerCase();
    
    const palavrasPagamento = [
      'fatura',
      'pagamento cartão',
      'pagamento de cartão',
      'pag cartao',
      'pag. cartão',
      'cartao credito',
      'cartão crédito',
      'cc ' + cartao.ultimos_digitos,
      'cartão ' + cartao.ultimos_digitos,
      `••••${cartao.ultimos_digitos}`,
      cartao.apelido?.toLowerCase()
    ].filter(Boolean);

    return palavrasPagamento.some(palavra => texto.includes(palavra));
  };

  // Função para verificar se uma transação pertence ao cartão
  const pertenceAoCartao = (transacao: any): boolean => {
    // Match por cartao_final
    if (transacao.cartao_final === cartao.ultimos_digitos) {
      return true;
    }

    // Match por apelido no título da transação
    if (cartao.apelido && transacao.titulo?.toLowerCase().includes(cartao.apelido.toLowerCase())) {
      return true;
    }

    // Match por forma de pagamento cartão e padrões no texto
    if (transacao.forma_pagamento?.toLowerCase() === 'cartão') {
      const textoCompleto = `${transacao.titulo} ${transacao.nome} ${transacao.estabelecimento} ${transacao.observacao}`.toLowerCase();
      const padroes = [
        `••••${cartao.ultimos_digitos}`,
        cartao.apelido?.toLowerCase(),
        `cartão ${cartao.ultimos_digitos}`,
        `cc ${cartao.ultimos_digitos}`,
        cartao.ultimos_digitos
      ].filter(Boolean);

      return padroes.some(padrao => textoCompleto.includes(padrao!));
    }

    return false;
  };

  // Buscar transações relacionadas ao cartão
  const fetchTransacoesCartao = async () => {
    if (!user || !cartao) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Buscar transações dos últimos 12 meses
      const dataLimite = new Date();
      dataLimite.setMonth(dataLimite.getMonth() - 12);
      
      const { data, error } = await supabase
        .from('registros_financeiros')
        .select(`
          id,
          valor,
          data,
          cartao_final,
          titulo,
          nome,
          forma_pagamento,
          estabelecimento,
          tipo_movimento,
          observacao
        `)
        .eq('user_id', user.id)
        .gte('data', dataLimite.toISOString().split('T')[0])
        .order('data', { ascending: false });

      if (error) throw error;

      // Filtrar apenas transações que pertencem a este cartão
      const transacoesDoCartao = (data || []).filter((transacao: any) => pertenceAoCartao(transacao));
      
      setTransacoes(transacoesDoCartao);
    } catch (error) {
      console.error('Erro ao buscar transações do cartão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular dados do limite dinâmico
  const limiteDinamico: LimiteDinamico = useMemo(() => {
    const limiteTotal = cartao.limite || 0;
    const limiteInicialDisponivel = cartao.limite_disponivel 
      ? parseFloat(cartao.limite_disponivel.toString()) 
      : limiteTotal;
    
    // Separar compras e pagamentos do mês atual
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    
    const transacoesDoMes = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao.getMonth() === mesAtual && dataTransacao.getFullYear() === anoAtual;
    });

    let comprasNoMes = 0;
    let pagamentosNoMes = 0;

    transacoesDoMes.forEach(transacao => {
      const valor = Math.abs(transacao.valor);
      
      if (isPagamentoFatura(transacao)) {
        // Pagamento de fatura - libera limite
        pagamentosNoMes += valor;
      } else if (transacao.forma_pagamento?.toLowerCase() === 'cartão' || 
                 transacao.tipo_movimento?.toLowerCase() === 'saida') {
        // Compra no cartão - consome limite
        comprasNoMes += valor;
      }
    });

    // Calcular limite atual disponível
    // Limite inicial - compras do mês + pagamentos do mês
    const limiteAtualDisponivel = limiteInicialDisponivel - comprasNoMes + pagamentosNoMes;
    
    const limiteUtilizado = limiteTotal - limiteAtualDisponivel;
    const percentualUtilizado = limiteTotal > 0 ? Math.max(0, (limiteUtilizado / limiteTotal) * 100) : 0;
    const diferenca = limiteAtualDisponivel - limiteInicialDisponivel;

    return {
      limiteTotal,
      limiteInicialDisponivel,
      limiteAtualDisponivel,
      limiteUtilizado: Math.max(0, limiteUtilizado),
      percentualUtilizado: Math.min(100, percentualUtilizado),
      comprasNoMes,
      pagamentosNoMes,
      transacoesCartao: transacoesDoMes,
      diferenca
    };
  }, [cartao, transacoes]);

  useEffect(() => {
    fetchTransacoesCartao();
  }, [user, cartao.id]);

  return {
    ...limiteDinamico,
    isLoading,
    refetch: fetchTransacoesCartao
  };
};