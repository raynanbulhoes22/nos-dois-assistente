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
      // Mapeamento inteligente para gastos fixos essenciais (EXCLUINDO financiamentos)
      const categoriasEssenciaisRelacionadas: { [key: string]: string[] } = {
        // Moradia
        'Aluguel': ['Aluguel', 'Moradia', 'Casa', 'Apartamento', 'Condomínio'],
        'Moradia': ['Aluguel', 'Moradia', 'Casa', 'Apartamento', 'Condomínio'],
        
        // Utilidades
        'Água': ['Água', 'Saneamento', 'SABESP', 'COPASA'],
        'Energia': ['Energia', 'Luz', 'Elétrica', 'CEMIG', 'CPFL', 'Light'],
        'Internet': ['Internet', 'Banda Larga', 'Fibra', 'Wi-Fi', 'Vivo', 'Claro', 'Tim', 'Oi'],
        
        // Transporte essencial (SEM financiamentos)
        'Transporte': ['Transporte', 'Ônibus', 'Metrô', 'Bilhete Único', 'Vale Transporte'],
        'Combustível': ['Combustível', 'Gasolina', 'Álcool', 'Diesel', 'Posto'],
        
        // Alimentação
        'Alimentação': ['Alimentação', 'Mercado', 'Supermercado', 'Restaurante', 'Comida', 'Lanche'],
        'Supermercado': ['Supermercado', 'Mercado', 'Alimentação', 'Compras'],
        
        // Saúde
        'Saúde': ['Saúde', 'Plano de Saúde', 'Médico', 'Hospital', 'Clínica'],
        'Farmácia': ['Farmácia', 'Medicamento', 'Remédio', 'Drogaria'],
        
        // Educação
        'Escola / Faculdade': ['Escola', 'Faculdade', 'Universidade', 'Mensalidade', 'Educação', 'Curso']
      };

      // Palavras-chave para busca por nome do gasto fixo
      const palavrasChaveEssenciais: { [key: string]: string[] } = {
        'aluguel': ['Aluguel', 'Moradia'],
        'luz': ['Energia'],
        'energia': ['Energia'],
        'internet': ['Internet'],
        'água': ['Água'],
        'gas': ['Energia'],
        'gasolina': ['Combustível'],
        'combustível': ['Combustível'],
        'mercado': ['Supermercado', 'Alimentação'],
        'supermercado': ['Supermercado', 'Alimentação'],
        'plano de saúde': ['Saúde'],
        'farmácia': ['Farmácia'],
        'escola': ['Escola / Faculdade'],
        'faculdade': ['Escola / Faculdade'],
        'mensalidade': ['Escola / Faculdade']
      };

      // Determinar categorias para buscar
      let categoriasParaBuscar = categoriasEssenciaisRelacionadas[gastoFixo.categoria] || [];
      
      // Se não encontrou por categoria, tentar por palavras-chave no nome
      if (categoriasParaBuscar.length === 0) {
        const nomeGasto = gastoFixo.nome.toLowerCase();
        for (const [palavra, categorias] of Object.entries(palavrasChaveEssenciais)) {
          if (nomeGasto.includes(palavra)) {
            categoriasParaBuscar = categorias;
            break;
          }
        }
      }
      
      // Fallback: usar a categoria original se não encontrou nada
      if (categoriasParaBuscar.length === 0) {
        categoriasParaBuscar = [gastoFixo.categoria].filter(Boolean);
      }
      
      const { data, error } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .in('categoria', categoriasParaBuscar)
        .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

      if (error) throw error;

      // Se não encontrou por categoria, tenta buscar por nome similar
      let registrosEncontrados = data || [];
      if (registrosEncontrados.length === 0) {
        const { data: dataByName, error: errorByName } = await supabase
          .from('registros_financeiros')
          .select('*')
          .eq('user_id', user.id)
          .ilike('categoria', `%${gastoFixo.nome.toLowerCase()}%`)
          .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);
        
        if (!errorByName) {
          registrosEncontrados = dataByName || [];
        }
      }

      // Verificar se algum registro tem valor dentro da tolerância de ±15%
      const valorGasto = Number(gastoFixo.valor_mensal);
      const tolerancia = valorGasto * 0.15;
      
      const registroMatch = registrosEncontrados.find(registro => {
        const valorRegistro = Math.abs(Number(registro.valor));
        const diferenca = Math.abs(valorRegistro - valorGasto);
        return diferenca <= tolerancia;
      });

      return registroMatch || null;
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err);
      return null;
    }
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

  const updateStatusManualGastoFixo = async (id: string, status: 'pago' | 'pendente', mes: number, ano: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('gastos_fixos')
        .update({
          status_manual: status,
          status_manual_mes: mes,
          status_manual_ano: ano
        } as any)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (err) {
      console.error('Erro ao atualizar status manual do gasto fixo:', err);
      throw err;
    }
  };

  const getGastosFixosComStatus = useCallback(async (mes: number, ano: number) => {
    const gastosAtivos = gastosFixos.filter(gasto => gasto.ativo);
    
    const gastosComStatus = await Promise.all(
      gastosAtivos.map(async (gasto: any) => {
        // Verificar se tem status manual para este mês/ano
        const temStatusManual = gasto.status_manual && 
                               gasto.status_manual_mes === mes && 
                               gasto.status_manual_ano === ano;

        let pago = false;
        let registroDetectado = null;
        let statusTipo = 'automatico';

        if (temStatusManual) {
          pago = gasto.status_manual === 'pago';
          statusTipo = 'manual';
        } else {
          registroDetectado = await checkPagamentoMesAtual(gasto, mes, ano);
          pago = !!registroDetectado;
        }

        return {
          ...gasto,
          pago,
          registroDetectado,
          statusTipo
        };
      })
    );

    return gastosComStatus;
  }, [gastosFixos, user]);

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
    updateStatusManualGastoFixo,
    refetch: fetchGastosFixos,
  };
};