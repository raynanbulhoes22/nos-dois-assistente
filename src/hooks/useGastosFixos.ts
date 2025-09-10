import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useFinancialCache } from '@/contexts/FinancialDataContext';
import { useRealtime } from '@/contexts/RealtimeContext';
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
  status_manual?: string;
  status_manual_mes?: number;
  status_manual_ano?: number;
  pago?: boolean;
}

export const useGastosFixos = () => {
  const { user } = useAuth();
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  const { registerInvalidationCallback } = useRealtime();
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGastosFixos = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = `gastos_fixos_${user.id}`;
      const cachedData = getFromCache<GastoFixo[]>(cacheKey);
      
      if (cachedData) {
        setGastosFixos(cachedData);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('compromissos_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'gasto_fixo')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const gastosData = (data || []).map(item => {
        const dadosEspecificos = item.dados_especificos as any;
        
        return {
          id: item.id,
          user_id: item.user_id,
          nome: item.nome,
          categoria: item.categoria,
          valor_mensal: item.valor_principal || 0,
          ativo: item.ativo,
          data_inicio: item.data_inicio || new Date().toISOString(),
          observacoes: dadosEspecificos?.observacoes,
          created_at: item.created_at,
          updated_at: item.updated_at,
          status_manual: item.status_manual,
          status_manual_mes: item.status_manual_mes,
          status_manual_ano: item.status_manual_ano
        } as GastoFixo;
      });

      setGastosFixos(gastosData);
      setCache(cacheKey, gastosData);
    } catch (error) {
      console.error('Erro ao buscar gastos fixos:', error);
      setError('Erro ao carregar dados');
      toast.error('Erro ao carregar gastos fixos');
    } finally {
      setIsLoading(false);
    }
  }, [user, getFromCache, setCache]);

  const addGastoFixo = useCallback(async (gasto: Omit<GastoFixo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('compromissos_financeiros')
        .insert({
          user_id: user.id,
          tipo_compromisso: 'gasto_fixo',
          nome: gasto.nome,
          categoria: gasto.categoria,
          ativo: gasto.ativo,
          valor_principal: gasto.valor_mensal,
          data_inicio: gasto.data_inicio,
          dados_especificos: {
            observacoes: gasto.observacoes
          },
          status_manual: gasto.status_manual,
          status_manual_mes: gasto.status_manual_mes,
          status_manual_ano: gasto.status_manual_ano
        })
        .select()
        .single();

      if (error) throw error;

      const cacheKey = `gastos_fixos_${user.id}`;
      invalidateCache(cacheKey);
      await fetchGastosFixos();

      toast.success(`${gasto.nome} adicionado com sucesso!`);
      return data;
    } catch (error) {
      console.error('Erro ao adicionar gasto fixo:', error);
      toast.error('Erro ao adicionar gasto fixo');
      return null;
    }
  }, [user, invalidateCache, fetchGastosFixos]);

  const updateGastoFixo = useCallback(async (id: string, updates: Partial<GastoFixo>) => {
    if (!user) return false;

    try {
      const updateData: any = {};
      
      if (updates.nome !== undefined) updateData.nome = updates.nome;
      if (updates.categoria !== undefined) updateData.categoria = updates.categoria;
      if (updates.ativo !== undefined) updateData.ativo = updates.ativo;
      if (updates.valor_mensal !== undefined) updateData.valor_principal = updates.valor_mensal;
      if (updates.data_inicio !== undefined) updateData.data_inicio = updates.data_inicio;
      if (updates.status_manual !== undefined) updateData.status_manual = updates.status_manual;
      if (updates.status_manual_mes !== undefined) updateData.status_manual_mes = updates.status_manual_mes;
      if (updates.status_manual_ano !== undefined) updateData.status_manual_ano = updates.status_manual_ano;
      
      // Construir dados_especificos
      if (updates.observacoes !== undefined) {
        updateData.dados_especificos = {
          observacoes: updates.observacoes
        };
      }

      const { error } = await supabase
        .from('compromissos_financeiros')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'gasto_fixo');

      if (error) throw error;

      const cacheKey = `gastos_fixos_${user.id}`;
      invalidateCache(cacheKey);
      await fetchGastosFixos();

      toast.success('Gasto fixo atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar gasto fixo:', error);
      toast.error('Erro ao atualizar gasto fixo');
      return false;
    }
  }, [user, invalidateCache, fetchGastosFixos]);

  const deleteGastoFixo = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('compromissos_financeiros')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'gasto_fixo');

      if (error) throw error;

      const cacheKey = `gastos_fixos_${user.id}`;
      invalidateCache(cacheKey);
      await fetchGastosFixos();

      toast.success('Gasto fixo removido com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao remover gasto fixo:', error);
      toast.error('Erro ao remover gasto fixo');
      return false;
    }
  }, [user, invalidateCache, fetchGastosFixos]);

  const getTotalGastosFixosAtivos = useCallback(() => {
    return gastosFixos
      .filter(gasto => gasto.ativo)
      .reduce((total, gasto) => total + gasto.valor_mensal, 0);
  }, [gastosFixos]);

  const getGastosFixosByStatus = useCallback((mes: number, ano: number) => {
    return gastosFixos.map(gasto => {
      let status = 'pendente';
      
      if (gasto.status_manual_mes === mes && gasto.status_manual_ano === ano) {
        status = gasto.status_manual || 'pendente';
      }
      
      return {
        ...gasto,
        status_atual: status
      };
    });
  }, [gastosFixos]);

  const updateStatusManual = useCallback(async (id: string, status: string, mes: number, ano: number) => {
    return await updateGastoFixo(id, {
      status_manual: status,
      status_manual_mes: mes,
      status_manual_ano: ano
    });
  }, [updateGastoFixo]);

  useEffect(() => {
    if (user) {
      fetchGastosFixos();
    }
  }, [user, fetchGastosFixos]);

  // Setup realtime listener
  useEffect(() => {
    if (!user) return;

    const unregister = registerInvalidationCallback('compromissos_financeiros', () => {
      const cacheKey = `gastos_fixos_${user.id}`;
      invalidateCache(cacheKey);
      fetchGastosFixos();
    });

    return unregister;
  }, [user, registerInvalidationCallback, invalidateCache, fetchGastosFixos]);

  const getGastosFixosComStatus = useCallback((mes: number, ano: number) => {
    return getGastosFixosByStatus(mes, ano);
  }, [getGastosFixosByStatus]);

  const getTotalGastosFixosNaoPagos = useCallback((mes: number, ano: number) => {
    const gastosComStatus = getGastosFixosByStatus(mes, ano);
    return gastosComStatus
      .filter(gasto => gasto.status_atual !== 'pago')
      .reduce((total, gasto) => total + gasto.valor_mensal, 0);
  }, [getGastosFixosByStatus]);

  const updateStatusManualGastoFixo = updateStatusManual;
  const createGastoFixo = addGastoFixo;
  
  return {
    gastosFixos,
    isLoading,
    error,
    addGastoFixo,
    updateGastoFixo,
    deleteGastoFixo,
    getTotalGastosFixosAtivos,
    getGastosFixosByStatus,
    updateStatusManual,
    getGastosFixosComStatus,
    getTotalGastosFixosNaoPagos,
    updateStatusManualGastoFixo,
    createGastoFixo,
    refetch: fetchGastosFixos
  };
};