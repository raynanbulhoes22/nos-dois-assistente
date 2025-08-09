import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface GastoFixo {
  id: string;
  user_id: string;
  nome: string;
  categoria?: string;
  valor_mensal: number;
  ativo: boolean;
  data_inicio: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const useGastosFixos = () => {
  const { user } = useAuth();
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGastosFixos = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('gastos_fixos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGastosFixos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar gastos fixos';
      setError(errorMessage);
      toast.error('Erro ao carregar gastos fixos');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createGastoFixo = async (gastoFixo: Omit<GastoFixo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('gastos_fixos')
        .insert({
          ...gastoFixo,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setGastosFixos(prev => [data, ...prev]);
      toast.success('Gasto fixo adicionado com sucesso!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar gasto fixo';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateGastoFixo = async (id: string, updates: Partial<Omit<GastoFixo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('gastos_fixos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setGastosFixos(prev => prev.map(item => item.id === id ? data : item));
      toast.success('Gasto fixo atualizado com sucesso!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar gasto fixo';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteGastoFixo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gastos_fixos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGastosFixos(prev => prev.filter(item => item.id !== id));
      toast.success('Gasto fixo removido com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover gasto fixo';
      toast.error(errorMessage);
      throw err;
    }
  };

  const getTotalGastosFixosAtivos = () => {
    return gastosFixos
      .filter(gasto => gasto.ativo)
      .reduce((total, gasto) => total + Number(gasto.valor_mensal), 0);
  };

  const getGastosFixosAtivos = () => {
    return gastosFixos.filter(gasto => gasto.ativo);
  };

  useEffect(() => {
    if (user) {
      fetchGastosFixos();
    }
  }, [user, fetchGastosFixos]);

  return {
    gastosFixos,
    isLoading,
    error,
    createGastoFixo,
    updateGastoFixo,
    deleteGastoFixo,
    getTotalGastosFixosAtivos,
    getGastosFixosAtivos,
    refetch: fetchGastosFixos,
  };
};