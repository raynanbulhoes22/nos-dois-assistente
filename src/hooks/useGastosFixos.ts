import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useFinancialCache } from '@/contexts/FinancialDataContext';
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
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
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
        .from('gastos_fixos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const gastosData = data || [];
      setGastosFixos(gastosData);
      setCache(cacheKey, gastosData, 5 * 60 * 1000); // Cache for 5 minutes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar gastos fixos';
      setError(errorMessage);
      toast.error('Erro ao carregar gastos fixos');
    } finally {
      setIsLoading(false);
    }
  }, [user, getFromCache, setCache]);

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
      invalidateCache(`gastos_fixos_${user.id}`);
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
      invalidateCache(`gastos_fixos_${user.id}`);
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
      invalidateCache(`gastos_fixos_${user.id}`);
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
      // Categorias essenciais que são mapeadas - EXPANDIDO
      const categoriasEssenciaisRelacionadas: { [key: string]: string[] } = {
        // Moradia
        'Aluguel': ['Aluguel', 'Moradia', 'Casa', 'Apartamento', 'Condomínio'],
        'Moradia': ['Aluguel', 'Moradia', 'Casa', 'Apartamento', 'Condomínio'],
        
        // Utilidades - EXPANDIDO
        'Água': ['Água', 'Saneamento', 'SABESP', 'COPASA', 'SANASA', 'SANEPAR', 'Serviços'],
        'Energia': ['Energia', 'Luz', 'Elétrica', 'CEMIG', 'CPFL', 'Light', 'Copel', 'Celpe', 'Coelba', 'Serviços'],
        'Internet': ['Internet', 'Banda Larga', 'Fibra', 'Wi-Fi', 'Vivo', 'Claro', 'Tim', 'Oi', 'Net', 'Serviços'],
        'Telefone': ['Telefone', 'Celular', 'Vivo', 'Claro', 'Tim', 'Oi', 'Serviços'],
        
        // Transporte essencial
        'Transporte': ['Transporte', 'Ônibus', 'Metrô', 'Bilhete Único', 'Vale Transporte'],
        'Combustível': ['Combustível', 'Gasolina', 'Álcool', 'Diesel', 'Posto'],
        
        // Alimentação
        'Alimentação': ['Alimentação', 'Mercado', 'Supermercado', 'Restaurante', 'Comida', 'Lanche'],
        'Supermercado': ['Supermercado', 'Mercado', 'Alimentação', 'Compras'],
        
        // Saúde
        'Saúde': ['Saúde', 'Plano de Saúde', 'Médico', 'Hospital', 'Clínica'],
        'Farmácia': ['Farmácia', 'Medicamento', 'Remédio', 'Drogaria'],
        
        // Educação
        'Escola / Faculdade': ['Escola', 'Faculdade', 'Universidade', 'Mensalidade', 'Educação', 'Curso'],

        // Serviços gerais
        'Serviços': ['Energia', 'Água', 'Internet', 'Telefone', 'Gás', 'TV por assinatura']
      };

      // Palavras-chave expandidas para busca por nome do gasto fixo
      const palavrasChaveEssenciais: { [key: string]: string[] } = {
        // Energia
        'luz': ['Energia', 'Serviços'],
        'energia': ['Energia', 'Serviços'],
        'elétrica': ['Energia', 'Serviços'],
        'cemig': ['Energia', 'Serviços'],
        'cpfl': ['Energia', 'Serviços'],
        'light': ['Energia', 'Serviços'],
        'copel': ['Energia', 'Serviços'],
        'celpe': ['Energia', 'Serviços'],
        'coelba': ['Energia', 'Serviços'],
        
        // Água
        'água': ['Água', 'Serviços'],
        'sabesp': ['Água', 'Serviços'],
        'copasa': ['Água', 'Serviços'],
        'sanasa': ['Água', 'Serviços'],
        'sanepar': ['Água', 'Serviços'],
        'saneamento': ['Água', 'Serviços'],
        
        // Internet/Telefone
        'internet': ['Internet', 'Serviços'],
        'telefone': ['Telefone', 'Internet', 'Serviços'],
        'celular': ['Telefone', 'Internet', 'Serviços'],
        'vivo': ['Internet', 'Telefone', 'Serviços'],
        'claro': ['Internet', 'Telefone', 'Serviços'],
        'tim': ['Internet', 'Telefone', 'Serviços'],
        'oi': ['Internet', 'Telefone', 'Serviços'],
        'net': ['Internet', 'Serviços'],
        'fibra': ['Internet', 'Serviços'],
        
        // Moradia
        'aluguel': ['Aluguel', 'Moradia'],
        'condomínio': ['Aluguel', 'Moradia'],
        'condominio': ['Aluguel', 'Moradia'],
        
        // Outros
        'gas': ['Energia', 'Serviços'],
        'gás': ['Energia', 'Serviços'],
        'gasolina': ['Combustível'],
        'combustível': ['Combustível'],
        'mercado': ['Supermercado', 'Alimentação'],
        'supermercado': ['Supermercado', 'Alimentação'],
        'plano de saúde': ['Saúde'],
        'plano': ['Saúde'],
        'farmácia': ['Farmácia'],
        'escola': ['Escola / Faculdade'],
        'faculdade': ['Escola / Faculdade'],
        'mensalidade': ['Escola / Faculdade']
      };

      // Função para calcular similaridade entre strings
      const calcularSimilaridade = (str1: string, str2: string): number => {
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        
        if (s1 === s2) return 1;
        if (s1.includes(s2) || s2.includes(s1)) return 0.8;
        
        // Verificar palavras comuns
        const palavras1 = s1.split(/\s+/);
        const palavras2 = s2.split(/\s+/);
        const intersecao = palavras1.filter(p => palavras2.includes(p));
        
        if (intersecao.length > 0) {
          return intersecao.length / Math.max(palavras1.length, palavras2.length);
        }
        
        return 0;
      };

      // Determinar categorias para buscar
      let categoriasParaBuscar = categoriasEssenciaisRelacionadas[gastoFixo.categoria] || [];
      
      // Se não encontrou por categoria, tentar por palavras-chave no nome
      if (categoriasParaBuscar.length === 0) {
        const nomeGasto = gastoFixo.nome.toLowerCase();
        for (const [palavra, categorias] of Object.entries(palavrasChaveEssenciais)) {
          if (nomeGasto.includes(palavra)) {
            categoriasParaBuscar = [...categoriasParaBuscar, ...categorias];
          }
        }
      }
      
      // Remover duplicatas
      categoriasParaBuscar = [...new Set(categoriasParaBuscar)];
      
      // Fallback: incluir a categoria original e 'Serviços'
      if (categoriasParaBuscar.length === 0) {
        categoriasParaBuscar = [gastoFixo.categoria, 'Serviços'].filter(Boolean);
      } else {
        categoriasParaBuscar.push('Serviços'); // Sempre incluir 'Serviços' como fallback
      }

      // 1. Buscar por categorias mapeadas
      const { data, error } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .in('categoria', categoriasParaBuscar)
        .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

      if (error) throw error;

      let registrosEncontrados = data || [];

      // 2. Se não encontrou por categoria, buscar por estabelecimento/nome similar
      if (registrosEncontrados.length === 0) {
        const { data: dataByEstabelecimento, error: errorByEstabelecimento } = await supabase
          .from('registros_financeiros')
          .select('*')
          .eq('user_id', user.id)
          .or(`estabelecimento.ilike.%${gastoFixo.nome}%,nome.ilike.%${gastoFixo.nome}%,titulo.ilike.%${gastoFixo.nome}%`)
          .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);
        
        if (!errorByEstabelecimento) {
          registrosEncontrados = dataByEstabelecimento || [];
        }
      }

      // 3. Busca mais ampla por similaridade de nome (apenas se ainda não encontrou)
      if (registrosEncontrados.length === 0) {
        const { data: dataByName, error: errorByName } = await supabase
          .from('registros_financeiros')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);
        
        if (!errorByName && dataByName) {
          // Filtrar por similaridade de nome
          registrosEncontrados = dataByName.filter(registro => {
            const campos = [
              registro.estabelecimento,
              registro.nome, 
              registro.titulo,
              registro.categoria
            ].filter(Boolean);
            
            return campos.some(campo => 
              calcularSimilaridade(campo, gastoFixo.nome) > 0.6
            );
          });
        }
      }

      // 4. Como último recurso, buscar apenas por valor similar em qualquer categoria
      if (registrosEncontrados.length === 0) {
        const valorGasto = Number(gastoFixo.valor_mensal);
        const toleranciaValor = valorGasto * 0.1; // 10% de tolerância

        const { data: dataByValue, error: errorByValue } = await supabase
          .from('registros_financeiros')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`)
          .gte('valor', -(valorGasto + toleranciaValor))
          .lte('valor', -(valorGasto - toleranciaValor));
        
        if (!errorByValue) {
          registrosEncontrados = dataByValue || [];
        }
      }

      // Verificar se algum registro tem valor dentro da tolerância de ±20% (aumentei a tolerância)
      const valorGasto = Number(gastoFixo.valor_mensal);
      const tolerancia = valorGasto * 0.2; // 20% de tolerância
      
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