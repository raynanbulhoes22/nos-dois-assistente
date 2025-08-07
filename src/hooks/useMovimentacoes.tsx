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

      // Buscar o número de WhatsApp do usuário usando uma query mais segura
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1);

      const userWhatsapp = (profileData as any)?.[0]?.numero_wpp;
      if (!userWhatsapp) {
        console.log('Usuário não tem WhatsApp conectado');
        setMovimentacoes([]);
        setEntradas([]);
        setSaidas([]);
        return;
      }

      // Criar variações do número de WhatsApp (limpar espaços e quebras de linha)
      const cleanWhatsapp = userWhatsapp.trim().replace(/\s+/g, '');
      const variations = [
        cleanWhatsapp,
        cleanWhatsapp.substring(2),
        cleanWhatsapp.substring(1),
        cleanWhatsapp.replace(/^55/, ''),
      ].filter(num => num && num.length >= 10);

      console.log('Buscando movimentações para números:', variations);

      // Buscar todos os registros financeiros usando LIKE para ignorar espaços e quebras de linha
      const { data: registros, error: registrosError } = await supabase
        .from('registros_financeiros')
        .select('*')
        .or(variations.map(num => `numero_wpp.like.${num}%`).join(','))
        .order('data', { ascending: false });

      if (registrosError) throw registrosError;

      if (!registros || registros.length === 0) {
        console.log('Nenhum registro encontrado');
        setMovimentacoes([]);
        setEntradas([]);
        setSaidas([]);
        return;
      }

      // Processar e categorizar os dados
      const movimentacoesProcessadas: Movimentacao[] = registros.map((item: any) => {
        const isEntrada = categorizarMovimentacao(item);
        
        return {
          id: item.id,
          valor: Math.abs(item.valor), // Sempre trabalhar com valores positivos
          data: item.data,
          categoria: item.categoria || 'Sem categoria',
          nome: item.nome || 'Sem descrição',
          forma_pagamento: item.forma_pagamento,
          estabelecimento: item.estabelecimento,
          observacao: item.observacao,
          tipo_movimento: item.tipo_movimento,
          numero_wpp: item.numero_wpp,
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