import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCache } from "@/contexts/FinancialDataContext";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhoneNumber } from "@/lib/phone-utils";
import { detectarECriarCartoesAutomaticos } from "@/lib/cartao-utils";
import { useToast } from "@/hooks/use-toast";
import { useCartaoProcessamento } from "@/hooks/useCartaoProcessamento";

export interface Movimentacao {
  id: string;
  valor: number;
  data: string;
  categoria?: string;
  nome?: string;
  titulo?: string;
  forma_pagamento?: string;
  estabelecimento?: string;
  observacao?: string;
  tipo_movimento?: string;
  numero_wpp?: string;
  instituicao?: string;
  cartao_final?: string;
  ultimos_digitos?: string;
  apelido?: string;
  origem?: string;
  recorrente?: boolean;
  id_transacao?: string;
  isEntrada: boolean;
}

interface MovimentacoesData {
  movimentacoes: Movimentacao[];
  entradas: Movimentacao[];
  saidas: Movimentacao[];
}

export const useMovimentacoes = () => {
  const { user } = useAuth();
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  const { toast } = useToast();
  const { processarTransacoes, verificarAlertas, atualizarLimitesDisponiveis } = useCartaoProcessamento();
  
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [entradas, setEntradas] = useState<Movimentacao[]>([]);
  const [saidas, setSaidas] = useState<Movimentacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce and deduplication
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastFetchRef = useRef<string>('');
  const isFetchingRef = useRef(false);

  const categorizarMovimentacao = useCallback((item: any): boolean => {
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
  }, []);

  const fetchMovimentacoes = useCallback(async (forceRefresh = false) => {
    if (!user || isFetchingRef.current) {
      setIsLoading(false);
      return;
    }

    // Generate cache key
    const cacheKey = `movimentacoes_${user.id}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getFromCache<MovimentacoesData>(cacheKey);
      if (cachedData) {
        setMovimentacoes(cachedData.movimentacoes);
        setEntradas(cachedData.entradas);
        setSaidas(cachedData.saidas);
        setIsLoading(false);
        return;
      }
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Primeiro, buscar o perfil do usuário para mapear números de WhatsApp
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1);

      const profile = (profileData as any)?.[0];
      const userWhatsapp = profile?.numero_wpp;
      
      // Criar mapeamento de números para nomes
      const phoneToNameMap: Record<string, string> = {};
      if (profile?.numero_wpp && profile?.nome) {
        phoneToNameMap[profile.numero_wpp] = profile.nome.trim();
      }
      if (profile?.telefone_conjuge && profile?.nome_conjuge) {
        phoneToNameMap[profile.telefone_conjuge] = profile.nome_conjuge.trim();
      }

      let registros: any[] = [];

      // Obter o mês e ano atual
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
      const currentYear = currentDate.getFullYear();
      
      // Calcular primeira e última data do mês atual
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      // Estratégia 1: Buscar por user_id (dados inseridos manualmente) - apenas do mês atual
      const { data: registrosPorUserId, error: errorUserId } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .neq('categoria', 'Saldo Inicial') // Filtrar registros de Saldo Inicial
        .gte('data', startOfMonth) // Data maior ou igual ao início do mês
        .lte('data', endOfMonth) // Data menor ou igual ao fim do mês
        .order('data', { ascending: false });

      if (registrosPorUserId && registrosPorUserId.length > 0) {
        registros = [...registrosPorUserId];
      }

      // Estratégia 2: Buscar por numero_wpp - todos os números associados a este user_id (apenas do mês atual)
      const { data: registrosPorWhatsapp } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id) // Buscar por user_id específico ao invés de número
        .neq('categoria', 'Saldo Inicial')
        .not('numero_wpp', 'is', null) // Apenas registros com número de WhatsApp
        .gte('data', startOfMonth) // Data maior ou igual ao início do mês
        .lte('data', endOfMonth) // Data menor ou igual ao fim do mês
        .order('data', { ascending: false });

      if (registrosPorWhatsapp && registrosPorWhatsapp.length > 0) {
        // Combinar com registros existentes e remover duplicatas
        const idsExistentes = new Set(registros.map((r: any) => r.id));
        const novosRegistros = registrosPorWhatsapp.filter((r: any) => !idsExistentes.has(r.id));
        registros = [...registros, ...novosRegistros];
      }

      if (!registros || registros.length === 0) {
        const emptyData: MovimentacoesData = {
          movimentacoes: [],
          entradas: [],
          saidas: []
        };
        
        setMovimentacoes([]);
        setEntradas([]);
        setSaidas([]);
        
        // Cache empty result briefly
        setCache(cacheKey, emptyData, 30000); // 30 seconds for empty results
        return;
      }

      // Processar e categorizar os dados
      const movimentacoesProcessadas: Movimentacao[] = registros.map((item: any) => {
        const isEntrada = categorizarMovimentacao(item);
        
        // Lógica inteligente para definir o título da transação
        const getTransactionTitle = (item: any): string => {
          // 1. Se tem título mas é uma descrição genérica de pagamento/parcela, usa outros campos
          if (item.titulo && item.titulo.trim()) {
            const titulo = item.titulo.trim();
            // Verifica se é uma descrição automática de parcela/pagamento
            const isAutomaticDescription = titulo.toLowerCase().includes('pagamento da parcela') || 
                                         titulo.toLowerCase().includes('parcela do') ||
                                         titulo.toLowerCase().includes('financiamento');
            
            if (!isAutomaticDescription) {
              return titulo;
            }
          }
          
          // 2. Se tem observação específica, usa ela
          if (item.observacao && item.observacao.trim() && item.observacao.length > 3) {
            return item.observacao.trim();
          }
          
          // 3. Se tem estabelecimento, usa ele
          if (item.estabelecimento && item.estabelecimento.trim()) {
            return item.estabelecimento.trim();
          }
          
          // 4. Se tem categoria definida e é diferente de "Sem categoria", usa ela
          if (item.categoria && item.categoria !== 'Sem categoria' && item.categoria.trim()) {
            return item.categoria.trim();
          }
          
          // 5. Se tem nome mas não é um nome de pessoa (contém espaço + sobrenome), usa ele
          if (item.nome && item.nome.trim()) {
            const nome = item.nome.trim();
            // Verifica se não é um nome de pessoa (heurística simples)
            const isProbablyPersonName = /^[A-Z][a-z]+ [A-Z][a-z]+/.test(nome);
            if (!isProbablyPersonName) {
              return nome;
            }
          }
          
          // 6. Se é uma descrição automática de parcela, volta para o título original
          if (item.titulo && item.titulo.trim()) {
            return item.titulo.trim();
          }
          
          // 7. Fallback baseado no tipo de movimento
          if (isEntrada) {
            return 'Entrada de valor';
          } else {
            return 'Gasto registrado';
          }
        };
        
        // Determinar quem registrou a transação
        const getRegisteredBy = (item: any): string => {
          // Se o campo nome está preenchido (movimentação manual), usa ele
          if (item.nome && item.nome.trim()) {
            return item.nome.trim();
          }
          
          // Se tem número de WhatsApp, mapeia para o nome correspondente
          if (item.numero_wpp && phoneToNameMap[item.numero_wpp]) {
            return phoneToNameMap[item.numero_wpp];
          }
          
          // Fallback para "WhatsApp" se não conseguir mapear
          if (item.numero_wpp) {
            return "WhatsApp";
          }
          
          // Se não tem informação, retorna string vazia
          return "";
        };
        
        return {
          id: item.id,
          valor: Math.abs(item.valor), // Sempre trabalhar com valores positivos
          data: item.data,
          categoria: item.categoria || 'Sem categoria',
          nome: getRegisteredBy(item), // Nome da pessoa que registrou a movimentação
          titulo: getTransactionTitle(item), // Título/descrição da transação
          forma_pagamento: item.forma_pagamento,
          estabelecimento: item.estabelecimento,
          observacao: item.observacao,
          tipo_movimento: item.tipo_movimento,
          numero_wpp: item.numero_wpp,
          instituicao: item.instituicao,
          cartao_final: item.cartao_final,
          ultimos_digitos: item.ultimos_digitos,
          apelido: item.apelido,
          origem: item.origem,
          recorrente: item.recorrente,
          id_transacao: item.id_transacao,
          isEntrada
        };
      });

      // Separar entradas e saídas
      const entradasList = movimentacoesProcessadas.filter(mov => mov.isEntrada);
      const saidasList = movimentacoesProcessadas.filter(mov => !mov.isEntrada);

      // Detectar e criar cartões automaticamente (apenas uma vez por sessão)
      const shouldDetectCards = !sessionStorage.getItem(`cards_detected_${user.id}`);
      
      if (shouldDetectCards && saidasList.length > 0) {
        try {
          // Buscar cartões existentes
          const { data: cartoesExistentes } = await supabase
            .from('cartoes_credito')
            .select('*')
            .eq('user_id', user.id);

          // Detectar cartões órfãos e criar automaticamente
          const resultado = await detectarECriarCartoesAutomaticos(
            movimentacoesProcessadas,
            cartoesExistentes || [],
            user.id
          );

          if (resultado.cartoesCriados > 0) {
            toast({
              title: "🎉 Cartões detectados!",
              description: `${resultado.cartoesCriados} cartão(s) criado(s) automaticamente baseado nas suas transações.`
            });
          }

          // Marcar que já foi feita a detecção nesta sessão
          sessionStorage.setItem(`cards_detected_${user.id}`, 'true');
        } catch (error) {
          console.error('Erro ao detectar cartões automaticamente:', error);
        }
      }

      const processedData: MovimentacoesData = {
        movimentacoes: movimentacoesProcessadas,
        entradas: entradasList,
        saidas: saidasList
      };

      // Update state
      setMovimentacoes(movimentacoesProcessadas);
      setEntradas(entradasList);
      setSaidas(saidasList);

      // Cache the results
      setCache(cacheKey, processedData);

      // Processar transações de cartão automaticamente (non-blocking)
      if (saidasList.length > 0) {
        setTimeout(async () => {
          try {
            // Buscar cartões ativos
            const { data: cartoesData } = await supabase
              .from('cartoes_credito')
              .select('*')
              .eq('user_id', user.id)
              .eq('ativo', true);

            if (cartoesData && cartoesData.length > 0) {
              // Atualizar limites disponíveis se necessário
              await atualizarLimitesDisponiveis(cartoesData, movimentacoesProcessadas);
              
              // Processar transações automaticamente
              await processarTransacoes(movimentacoesProcessadas, cartoesData);
              
              // Verificar alertas de limite
              const alertas = verificarAlertas(cartoesData);
              if (alertas.length > 0) {
                console.log('Alertas de cartão:', alertas);
              }
            }
          } catch (error) {
            console.error('Erro ao processar cartões:', error);
          }
        }, 100);
      }

    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      setError('Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user, getFromCache, setCache, categorizarMovimentacao, toast, processarTransacoes, verificarAlertas, atualizarLimitesDisponiveis]);

  // Debounced fetch effect
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Clear any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      const fetchKey = `${user.id}_${Date.now()}`;
      if (lastFetchRef.current !== fetchKey) {
        lastFetchRef.current = fetchKey;
        fetchMovimentacoes();
      }
    }, 100);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [user, fetchMovimentacoes]);

  const refetch = useCallback((forceRefresh = false) => {
    if (user) {
      if (forceRefresh) {
        invalidateCache(`movimentacoes_${user.id}`);
      }
      fetchMovimentacoes(forceRefresh);
    }
  }, [user, fetchMovimentacoes, invalidateCache]);

  // Memoize return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    movimentacoes,
    entradas,
    saidas,
    isLoading,
    error,
    refetch
  }), [movimentacoes, entradas, saidas, isLoading, error, refetch]);

  return returnValue;
};