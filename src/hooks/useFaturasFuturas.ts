import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCache } from "@/contexts/FinancialDataContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FaturaFutura {
  id: string;
  user_id: string;
  cartao_id: string;
  valor: number;
  data: string;
  mes: number;
  ano: number;
  descricao: string;
  categoria?: string;
  created_at: string;
  apelido_cartao?: string;
  ultimos_digitos?: string;
}

export const useFaturasFuturas = () => {
  const { user } = useAuth();
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  const { registerInvalidationCallback } = useRealtime();
  const { toast } = useToast();
  const [faturas, setFaturas] = useState<FaturaFutura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaturasFuturas = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const cacheKey = `faturas_futuras_${user.id}`;
      const cachedData = getFromCache<FaturaFutura[]>(cacheKey);
      
      if (cachedData) {
        setFaturas(cachedData);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('registros_financeiros')
        .select(`
          id,
          user_id,
          valor,
          data,
          titulo,
          categoria,
          observacao,
          criado_em,
          cartao_final,
          apelido
        `)
        .eq('user_id', user.id)
        .eq('origem', 'fatura_futura')
        .eq('tipo_movimento', 'saida')
        .gte('data', new Date().toISOString().split('T')[0])
        .order('data', { ascending: true });

      if (error) throw error;

      const faturasMapeadas = (data || []).map(item => {
        const dataObj = new Date(item.data);
        return {
          id: item.id,
          user_id: item.user_id,
          cartao_id: item.cartao_final || '',
          valor: Number(item.valor),
          data: item.data,
          mes: dataObj.getMonth() + 1,
          ano: dataObj.getFullYear(),
          descricao: item.titulo || '',
          categoria: item.categoria,
          created_at: item.criado_em,
          apelido_cartao: item.apelido,
          ultimos_digitos: item.cartao_final
        } as FaturaFutura;
      });

      setFaturas(faturasMapeadas);
      setCache(cacheKey, faturasMapeadas, 5 * 60 * 1000); // Cache for 5 minutes
    } catch (error) {
      console.error('Erro ao buscar faturas futuras:', error);
      setError('Erro ao carregar faturas futuras');
    } finally {
      setIsLoading(false);
    }
  }, [user, getFromCache, setCache]);

  const addFaturaFutura = async (fatura: Omit<FaturaFutura, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('registros_financeiros')
        .insert({
          user_id: user.id,
          valor: fatura.valor,
          data: fatura.data,
          titulo: fatura.descricao,
          categoria: fatura.categoria || 'Fatura de Cartão',
          observacao: `Fatura futura programada - ${fatura.apelido_cartao}`,
          origem: 'fatura_futura',
          tipo_movimento: 'saida',
          forma_pagamento: 'cartao_credito',
          cartao_final: fatura.ultimos_digitos,
          apelido: fatura.apelido_cartao,
          tipo: 'registro_manual',
          id_transacao: `fatura_futura_${Date.now()}_${fatura.cartao_id}` // ID único para vincular
        });

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fatura futura adicionada com sucesso!"
      });

      invalidateCache(`faturas_futuras_${user.id}`);
      await fetchFaturasFuturas();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar fatura futura:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar a fatura futura.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateFaturaFutura = async (id: string, updates: Partial<FaturaFutura>) => {
    try {
      const updateData: any = {};
      
      if (updates.valor !== undefined) updateData.valor = updates.valor;
      if (updates.data !== undefined) updateData.data = updates.data;
      if (updates.descricao !== undefined) updateData.titulo = updates.descricao;
      if (updates.categoria !== undefined) updateData.categoria = updates.categoria;

      const { error } = await supabase
        .from('registros_financeiros')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fatura futura atualizada com sucesso!"
      });

      invalidateCache(`faturas_futuras_${user.id}`);
      await fetchFaturasFuturas();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar fatura futura:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a fatura futura.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteFaturaFutura = async (id: string) => {
    try {
      const { error } = await supabase
        .from('registros_financeiros')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fatura futura removida com sucesso!"
      });

      invalidateCache(`faturas_futuras_${user.id}`);
      await fetchFaturasFuturas();
      return true;
    } catch (error) {
      console.error('Erro ao remover fatura futura:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover a fatura futura.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getFaturasPorMes = (mes: number, ano: number) => {
    return faturas.filter(fatura => fatura.mes === mes && fatura.ano === ano);
  };

  const getTotalFaturasFuturas = () => {
    return faturas.reduce((total, fatura) => total + fatura.valor, 0);
  };

  const getProximasFaturas = (limite = 5) => {
    return faturas
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, limite);
  };

  useEffect(() => {
    fetchFaturasFuturas();
  }, [fetchFaturasFuturas]);

  // Setup realtime listener
  useEffect(() => {
    if (!user) return;

    const cleanup = registerInvalidationCallback('registros_financeiros', () => {
      console.log('[useFaturasFuturas] Realtime update triggered');
      fetchFaturasFuturas();
    });

    return cleanup;
  }, [user, registerInvalidationCallback, fetchFaturasFuturas]);

  return {
    faturas,
    isLoading,
    error,
    addFaturaFutura,
    updateFaturaFutura,
    deleteFaturaFutura,
    getFaturasPorMes,
    getTotalFaturasFuturas,
    getProximasFaturas,
    refetch: fetchFaturasFuturas
  };
};