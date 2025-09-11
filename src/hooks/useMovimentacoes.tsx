import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCache } from "@/hooks/useFinancialCache";
import { useRealtime } from "@/contexts/RealtimeContext";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhoneNumber } from "@/lib/phone-utils";
import { detectarECriarCartoesAutomaticos } from "@/lib/cartao-utils";
import { useToast } from "@/hooks/use-toast";
import { useCartaoProcessamento } from "@/hooks/useCartaoProcessamento";
import { categorizeMovimentacao, logFinancialCalculation } from "@/lib/financial-utils";
import type { Cartao } from "@/hooks/useCompromissosFinanceiros";
import type { BaseMovimentacao } from "@/types/financial";

export interface Movimentacao extends BaseMovimentacao {
  // This interface now extends the centralized BaseMovimentacao
}

interface MovimentacoesData {
  movimentacoes: Movimentacao[];
  entradas: Movimentacao[];
  saidas: Movimentacao[];
}

export const useMovimentacoes = () => {
  const { user } = useAuth();
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  const { registerInvalidationCallback } = useRealtime();
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

  // Use centralized categorization logic
  const categorizarMovimentacao = useCallback((item: any): boolean => {
    return categorizeMovimentacao(item);
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

      // Buscar dados dos últimos 12 meses para cálculos precisos
      const currentDate = new Date();
      const twelveMonthsAgo = new Date(currentDate);
      twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
      
      const startDate = twelveMonthsAgo.toISOString().split('T')[0];
      const endDate = currentDate.toISOString().split('T')[0];

      console.log('🔍 useMovimentacoes - Buscando dados do período:', {
        startDate,
        endDate,
        mesesIncluidos: 12
      });

      // Estratégia 1: Buscar por user_id (dados inseridos manualmente) - últimos 12 meses
      const { data: registrosPorUserId, error: errorUserId } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .neq('categoria', 'Saldo Inicial') // Filtrar registros de Saldo Inicial
        .gte('data', startDate) // Data dos últimos 12 meses
        .lte('data', endDate) // Data até hoje
        .order('data', { ascending: false });

      if (registrosPorUserId && registrosPorUserId.length > 0) {
        registros = [...registrosPorUserId];
      }

      // Estratégia 2: Buscar por numero_wpp - todos os números associados a este user_id (últimos 12 meses)
      const { data: registrosPorWhatsapp } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id) // Buscar por user_id específico ao invés de número
        .neq('categoria', 'Saldo Inicial')
        .not('numero_wpp', 'is', null) // Apenas registros com número de WhatsApp
        .gte('data', startDate) // Data dos últimos 12 meses
        .lte('data', endDate) // Data até hoje
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

      console.log(`📊 Processando ${registros.length} registros financeiros dos últimos 12 meses`);
      logFinancialCalculation('useMovimentacoes - fetch', { 
        totalRegistros: registros.length,
        periodoInicio: startDate,
        periodoFim: endDate 
      });

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
            .from('compromissos_financeiros')
            .select('*')
            .eq('user_id', user.id)
            .eq('tipo_compromisso', 'cartao_credito');

          // Detectar cartões órfãos e criar automaticamente
          const cartoesTransformados = (cartoesExistentes || []).map(c => {
            const dadosEspecificos = c.dados_especificos as any;
            return {
              ...c,
              apelido: c.nome,
              ultimos_digitos: dadosEspecificos?.ultimos_digitos || '',
              limite: c.valor_principal || 0,
              limite_disponivel: dadosEspecificos?.limite_disponivel,
              dia_vencimento: c.data_vencimento ? new Date(c.data_vencimento).getDate() : 1,
              vencimento_fatura: c.data_vencimento ? new Date(c.data_vencimento).getDate() : 1
            };
          });

          const resultado = await detectarECriarCartoesAutomaticos(
            movimentacoesProcessadas,
            cartoesTransformados,
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
              .from('compromissos_financeiros')
              .select('*')
              .eq('user_id', user.id)
              .eq('tipo_compromisso', 'cartao_credito')
              .eq('ativo', true);

            if (cartoesData && cartoesData.length > 0) {
              // Transformar dados brutos em formato Cartao
              const cartoesTransformados = cartoesData.map(c => {
                const dadosEspecificos = c.dados_especificos as any;
                return {
                  id: c.id,
                  user_id: c.user_id,
                  tipo_compromisso: 'cartao_credito' as const,
                  nome: c.nome,
                  descricao: c.descricao,
                  categoria: c.categoria,
                  ativo: c.ativo,
                  valor_principal: c.valor_principal,
                  data_vencimento: c.data_vencimento,
                  total_parcelas: c.total_parcelas,
                  parcelas_pagas: c.parcelas_pagas,
                  dados_especificos: c.dados_especificos,
                  status_manual: c.status_manual,
                  status_manual_mes: c.status_manual_mes,
                  status_manual_ano: c.status_manual_ano,
                  created_at: c.created_at,
                  updated_at: c.updated_at,
                  apelido: c.nome,
                  ultimos_digitos: dadosEspecificos?.ultimos_digitos || '',
                  limite: c.valor_principal || 0,
                  limite_disponivel: dadosEspecificos?.limite_disponivel,
                  dia_vencimento: c.data_vencimento ? new Date(c.data_vencimento).getDate() : 1,
                  vencimento_fatura: c.data_vencimento ? new Date(c.data_vencimento).getDate() : 1
                } as Cartao;
              });

              // Atualizar limites disponíveis se necessário
              await atualizarLimitesDisponiveis(cartoesTransformados, movimentacoesProcessadas);
              
              // Processar transações automaticamente
              await processarTransacoes(movimentacoesProcessadas, cartoesTransformados);
              
              // Verificar alertas de limite
              const alertas = verificarAlertas(cartoesTransformados);
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

  // Debounced fetch effect - Reduced timeout for faster loading
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Clear any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Reduce debounce delay for faster loading
    fetchTimeoutRef.current = setTimeout(() => {
      fetchMovimentacoes();
    }, 50); // Reduced from 100ms to 50ms

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [user, fetchMovimentacoes]);

  // Setup realtime listener
  useEffect(() => {
    if (!user) return;

    const cleanup = registerInvalidationCallback('registros_financeiros', () => {
      console.log('[useMovimentacoes] Realtime update triggered');
      fetchMovimentacoes(true); // Force refresh on realtime update
    });

    return cleanup;
  }, [user, registerInvalidationCallback, fetchMovimentacoes]);

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