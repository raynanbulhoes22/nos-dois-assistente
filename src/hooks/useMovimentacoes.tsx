import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface Movimentacao {
  id: string;
  valor: number;
  data: string;
  categoria?: string;
  nome?: string;
  forma_pagamento?: string;
  estabelecimento?: string;
  observacao?: string;
  tipo_movimento?: string;
  numero_wpp?: string;
  instituicao?: string;
  cartao_final?: string;
  origem?: string;
  recorrente?: boolean;
  id_transacao?: string;
  isEntrada: boolean;
}

export const useMovimentacoes = () => {
  const { user } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [entradas, setEntradas] = useState<Movimentacao[]>([]);
  const [saidas, setSaidas] = useState<Movimentacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categorizarMovimentacao = (item: any): boolean => {
    // Verificar primeiro o campo tipo_movimento
    if (item.tipo_movimento) {
      return item.tipo_movimento.toLowerCase() === 'entrada';
    }

    // Verificar categoria por palavras-chave
    const categoria = (item.categoria || '').toLowerCase();
    const nome = (item.nome || '').toLowerCase();
    
    const palavrasEntrada = [
      'pagamento', 'recebimento', 'entrada', 'salário', 'renda', 
      'venda', 'depósito', 'pix recebido', 'transferência recebida',
      'cliente', 'receita'
    ];

    const palavrasSaida = [
      'compra', 'gasto', 'saída', 'pagamento de', 'despesa',
      'aluguel', 'conta', 'supermercado', 'combustível'
    ];

    // Verificar se é entrada
    if (palavrasEntrada.some(palavra => categoria.includes(palavra) || nome.includes(palavra))) {
      return true;
    }

    // Verificar se é saída
    if (palavrasSaida.some(palavra => categoria.includes(palavra) || nome.includes(palavra))) {
      return false;
    }

    // Default: valores positivos são entradas, negativos são saídas
    return item.valor > 0;
  };

  const fetchMovimentacoes = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar o número de WhatsApp do usuário
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1);

      const userWhatsapp = (profileData as any)?.[0]?.numero_wpp;
      console.log('Número do usuário:', userWhatsapp);

      let registros: any[] = [];

      // Estratégia 1: Buscar por user_id (dados inseridos manualmente)
      const { data: registrosPorUserId, error: errorUserId } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      if (registrosPorUserId && registrosPorUserId.length > 0) {
        registros = [...registrosPorUserId];
        console.log(`Encontrados ${registrosPorUserId.length} registros por user_id`);
      }

      // Estratégia 2: Buscar por numero_wpp usando TRIM() no SQL (dados do WhatsApp)
      if (userWhatsapp) {
        const cleanWhatsapp = userWhatsapp.trim().replace(/\s+/g, '');
        const variations = [
          cleanWhatsapp,
          cleanWhatsapp.substring(2),
          cleanWhatsapp.substring(1),
          cleanWhatsapp.replace(/^55/, ''),
        ].filter(num => num && num.length >= 10);

        console.log('Buscando por números:', variations);

        // Buscar usando uma estratégia mais agressiva com ILIKE
        const { data: registrosPorWhatsapp } = await supabase
          .from('registros_financeiros')
          .select('*')
          .or(variations.map(num => `numero_wpp.ilike.%${num}%`).join(','))
          .order('data', { ascending: false });

        if (registrosPorWhatsapp && registrosPorWhatsapp.length > 0) {
          // Combinar com registros existentes e remover duplicatas
          const idsExistentes = new Set(registros.map((r: any) => r.id));
          const novosRegistros = registrosPorWhatsapp.filter((r: any) => !idsExistentes.has(r.id));
          registros = [...registros, ...novosRegistros];
          console.log(`Encontrados ${novosRegistros.length} novos registros por WhatsApp`);
        }
      }

      if (!registros || registros.length === 0) {
        console.log('Nenhum registro encontrado com nenhuma estratégia');
        setMovimentacoes([]);
        setEntradas([]);
        setSaidas([]);
        return;
      }

      // Processar e categorizar os dados
      const movimentacoesProcessadas: Movimentacao[] = registros.map((item: any) => {
        const isEntrada = categorizarMovimentacao(item);
        
        // Lógica inteligente para definir o título da transação
        const getTransactionTitle = (item: any): string => {
          // 1. Se tem observação específica, usa ela
          if (item.observacao && item.observacao.trim() && item.observacao.length > 3) {
            return item.observacao.trim();
          }
          
          // 2. Se tem categoria definida e é diferente de "Sem categoria", usa ela
          if (item.categoria && item.categoria !== 'Sem categoria' && item.categoria.trim()) {
            return item.categoria.trim();
          }
          
          // 3. Se tem estabelecimento, usa ele
          if (item.estabelecimento && item.estabelecimento.trim()) {
            return item.estabelecimento.trim();
          }
          
          // 4. Se tem nome mas não é um nome de pessoa (contém espaço + sobrenome), usa ele
          if (item.nome && item.nome.trim()) {
            const nome = item.nome.trim();
            // Verifica se não é um nome de pessoa (heurística simples)
            const isProbablyPersonName = /^[A-Z][a-z]+ [A-Z][a-z]+/.test(nome);
            if (!isProbablyPersonName) {
              return nome;
            }
          }
          
          // 5. Fallback baseado no tipo de movimento
          if (isEntrada) {
            return 'Entrada de valor';
          } else {
            return 'Gasto registrado';
          }
        };
        
        return {
          id: item.id,
          valor: Math.abs(item.valor), // Sempre trabalhar com valores positivos
          data: item.data,
          categoria: item.categoria || 'Sem categoria',
          nome: getTransactionTitle(item),
          forma_pagamento: item.forma_pagamento,
          estabelecimento: item.estabelecimento,
          observacao: item.observacao,
          tipo_movimento: item.tipo_movimento,
          numero_wpp: item.numero_wpp,
          instituicao: item.instituicao,
          cartao_final: item.cartao_final,
          origem: item.origem,
          recorrente: item.recorrente,
          id_transacao: item.id_transacao,
          isEntrada
        };
      });

      // Separar entradas e saídas
      const entradasList = movimentacoesProcessadas.filter(mov => mov.isEntrada);
      const saidasList = movimentacoesProcessadas.filter(mov => !mov.isEntrada);

      console.log(`Processadas: ${movimentacoesProcessadas.length} movimentações`);
      console.log(`Entradas: ${entradasList.length}, Saídas: ${saidasList.length}`);

      setMovimentacoes(movimentacoesProcessadas);
      setEntradas(entradasList);
      setSaidas(saidasList);

    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      setError('Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimentacoes();
  }, [user]);

  const refetch = () => {
    fetchMovimentacoes();
  };

  return {
    movimentacoes,
    entradas,
    saidas,
    isLoading,
    error,
    refetch
  };
};