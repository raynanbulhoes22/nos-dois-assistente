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

  const checkPagamentoMesAtual = async (gastoFixo: GastoFixo, mes: number, ano: number) => {
    if (!user) return null;

    try {
      console.log(`🔍 Verificando pagamento para gasto: ${gastoFixo.nome}`, {
        categoria: gastoFixo.categoria,
        valor: gastoFixo.valor_mensal,
        mes,
        ano
      });

      const { data, error } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .eq('categoria', gastoFixo.categoria)
        .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

      if (error) throw error;

      console.log(`📊 Registros encontrados para ${gastoFixo.nome}:`, data?.length || 0, data);

      // Verificar se algum registro tem valor dentro da tolerância de ±15%
      const valorGasto = Number(gastoFixo.valor_mensal);
      const tolerancia = valorGasto * 0.15;
      
      console.log(`💰 Valor do gasto: ${valorGasto}, Tolerância: ±${tolerancia}`);
      
      const registroMatch = data?.find(registro => {
        const valorRegistro = Math.abs(Number(registro.valor));
        const diferenca = Math.abs(valorRegistro - valorGasto);
        const dentroTolerancia = diferenca <= tolerancia;
        
        console.log(`🔎 Comparando registro:`, {
          valorRegistro,
          valorGasto,
          diferenca,
          tolerancia,
          dentroTolerancia,
          data: registro.data,
          categoria: registro.categoria
        });
        
        return dentroTolerancia;
      });

      console.log(`✅ Match encontrado para ${gastoFixo.nome}:`, !!registroMatch, registroMatch);

      return registroMatch || null;
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err);
      return null;
    }
  };

  const getGastosFixosComStatus = async (mes: number, ano: number) => {
    console.log(`🔄 getGastosFixosComStatus chamado para ${mes}/${ano}`);
    const gastosAtivos = gastosFixos.filter(gasto => gasto.ativo);
    console.log(`📋 Gastos ativos encontrados:`, gastosAtivos.length);
    
    const gastosComStatus = await Promise.all(
      gastosAtivos.map(async (gasto) => {
        const registroPagamento = await checkPagamentoMesAtual(gasto, mes, ano);
        const status = {
          ...gasto,
          pago: !!registroPagamento,
          registroDetectado: registroPagamento
        };
        console.log(`📊 Status final para ${gasto.nome}:`, status.pago ? 'PAGO' : 'PENDENTE');
        return status;
      })
    );

    console.log(`✅ Todos os gastos processados:`, gastosComStatus);
    return gastosComStatus;
  };

  const getTotalGastosFixosNaoPagos = async (mes: number, ano: number) => {
    const gastosComStatus = await getGastosFixosComStatus(mes, ano);
    return gastosComStatus
      .filter(gasto => !gasto.pago)
      .reduce((total, gasto) => total + Number(gasto.valor_mensal), 0);
  };

  const getTotalGastosFixosAtivos = () => {
    return gastosFixos
      .filter(gasto => gasto.ativo)
      .reduce((total, gasto) => total + Number(gasto.valor_mensal), 0);
  };

  const getGastosFixosAtivos = () => {
    return gastosFixos.filter(gasto => gasto.ativo);
  };

  const getMatchingRegistro = async (gastoFixo: GastoFixo, mes: number, ano: number) => {
    return await checkPagamentoMesAtual(gastoFixo, mes, ano);
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
    checkPagamentoMesAtual,
    getGastosFixosComStatus,
    getTotalGastosFixosNaoPagos,
    getMatchingRegistro,
    refetch: fetchGastosFixos,
  };
};