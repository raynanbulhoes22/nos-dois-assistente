import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFinancialCache } from "@/contexts/FinancialDataContext";
import { useRealtime } from "@/contexts/RealtimeContext";

// Interface base unificada
export interface CompromissoFinanceiro {
  id: string;
  user_id: string;
  tipo_compromisso: 'cartao_credito' | 'gasto_fixo' | 'conta_parcelada';
  nome: string;
  descricao?: string;
  categoria?: string;
  ativo: boolean;
  valor_principal?: number;
  data_vencimento?: string; // Data única para todos os tipos de compromisso
  total_parcelas?: number;
  parcelas_pagas: number;
  dados_especificos: Record<string, any>;
  status_manual?: string;
  status_manual_mes?: number;
  status_manual_ano?: number;
  created_at: string;
  updated_at: string;
}

// Interfaces específicas para backward compatibility
export interface Cartao extends CompromissoFinanceiro {
  tipo_compromisso: 'cartao_credito';
  apelido: string;
  ultimos_digitos: string;
  limite: number;
  limite_disponivel?: string;
  data_vencimento?: string; // Nova coluna unificada
  dia_vencimento?: number; // Calculado dinamicamente a partir de data_vencimento (backward compatibility)
  vencimento_fatura?: number; // Alias para dia_vencimento (backward compatibility)
}

export interface GastoFixo extends CompromissoFinanceiro {
  tipo_compromisso: 'gasto_fixo';
  valor_mensal: number;
  observacoes?: string;
  dia_pagamento?: number; // Extraído de data_vencimento
}

export interface ContaParcelada extends CompromissoFinanceiro {
  tipo_compromisso: 'conta_parcelada';
  valor_parcela: number;
  data_primeira_parcela: string; // Vem da coluna data_vencimento
  tipo_financiamento?: string;
  instituicao_financeira?: string;
  loja?: string;
  finalidade?: string;
  taxa_juros?: number;
  debito_automatico?: boolean;
}

export const useCompromissosFinanceiros = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [compromissos, setCompromissos] = useState<CompromissoFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `compromissos_financeiros_${user?.id}`;
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  const { registerInvalidationCallback } = useRealtime();

  const fetchCompromissos = useCallback(async () => {
    if (!user) return;

    // Verificar cache primeiro
    const cachedData = getFromCache<CompromissoFinanceiro[]>(cacheKey);
    if (cachedData) {
      setCompromissos(cachedData);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: queryError } = await supabase
        .from('compromissos_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      const compromissosData = (data || []) as CompromissoFinanceiro[];
      setCompromissos(compromissosData);
      setCache(cacheKey, compromissosData);
    } catch (error) {
      console.error('Erro ao buscar compromissos financeiros:', error);
      setError('Erro ao carregar compromissos financeiros');
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os compromissos financeiros.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, cacheKey, getFromCache, setCache]);

  const addCompromisso = useCallback(async (compromisso: Omit<CompromissoFinanceiro, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('compromissos_financeiros')
        .insert({
          ...compromisso,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      invalidateCache(cacheKey);
      await fetchCompromissos();
      
      toast({
        title: "✅ Sucesso!",
        description: `${compromisso.nome} foi adicionado com sucesso.`
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar compromisso:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar o compromisso.",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, cacheKey, invalidateCache, fetchCompromissos]);

  const updateCompromisso = useCallback(async (id: string, updates: Partial<CompromissoFinanceiro>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('compromissos_financeiros')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      invalidateCache(cacheKey);
      await fetchCompromissos();
      
      toast({
        title: "✅ Atualizado!",
        description: "Compromisso atualizado com sucesso."
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar compromisso:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar o compromisso.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, cacheKey, invalidateCache, fetchCompromissos]);

  const deleteCompromisso = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('compromissos_financeiros')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      invalidateCache(cacheKey);
      await fetchCompromissos();
      
      toast({
        title: "✅ Removido!",
        description: "Compromisso removido com sucesso."
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover compromisso:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover o compromisso.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, cacheKey, invalidateCache, fetchCompromissos]);

  // Função utilitária para extrair dia da data_vencimento
  const extrairDiaVencimento = (dataVencimento: string): number => {
    if (!dataVencimento) return 1;
    return new Date(dataVencimento).getDate();
  };

  // Getters específicos por tipo
  const cartoes = useMemo(() => 
    compromissos
      .filter(c => c.tipo_compromisso === 'cartao_credito')
      .map(c => ({
        ...c,
        apelido: c.nome,
        ultimos_digitos: c.dados_especificos?.ultimos_digitos || '',
        limite: c.valor_principal || 0,
        limite_disponivel: c.dados_especificos?.limite_disponivel,
        // Manter backward compatibility
        dia_vencimento: c.data_vencimento ? extrairDiaVencimento(c.data_vencimento) : undefined,
        vencimento_fatura: c.data_vencimento ? extrairDiaVencimento(c.data_vencimento) : undefined
      } as Cartao))
  , [compromissos]);

  const gastosFixos = useMemo(() =>
    compromissos
      .filter(c => c.tipo_compromisso === 'gasto_fixo')
      .map(c => ({
        ...c,
        valor_mensal: c.valor_principal || 0,
        observacoes: c.dados_especificos?.observacoes,
        dia_pagamento: c.data_vencimento ? extrairDiaVencimento(c.data_vencimento) : undefined
      } as GastoFixo))
  , [compromissos]);

  const contasParceladas = useMemo(() =>
    compromissos
      .filter(c => c.tipo_compromisso === 'conta_parcelada')
      .map(c => ({
        ...c,
        valor_parcela: c.valor_principal || 0,
        data_primeira_parcela: c.data_vencimento || '',
        tipo_financiamento: c.dados_especificos?.tipo_financiamento,
        instituicao_financeira: c.dados_especificos?.instituicao_financeira,
        loja: c.dados_especificos?.loja,
        finalidade: c.dados_especificos?.finalidade,
        taxa_juros: c.dados_especificos?.taxa_juros,
        debito_automatico: c.dados_especificos?.debito_automatico
      } as ContaParcelada))
  , [compromissos]);

  useEffect(() => {
    if (user) {
      fetchCompromissos();
    }
  }, [user, fetchCompromissos]);

  // Setup real-time invalidation
  useEffect(() => {
    const unregister = registerInvalidationCallback('compromissos_financeiros', () => {
      invalidateCache(cacheKey);
      fetchCompromissos();
    });
    return unregister;
  }, [registerInvalidationCallback, invalidateCache, cacheKey, fetchCompromissos]);

  return {
    // Dados unificados
    compromissos,
    isLoading,
    error,
    
    // Dados específicos por tipo (backward compatibility)
    cartoes,
    gastosFixos,
    contasParceladas,
    
    // Métodos CRUD
    addCompromisso,
    updateCompromisso,
    deleteCompromisso,
    refetch: fetchCompromissos
  };
};