import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCache } from "@/contexts/FinancialDataContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ContaParcelada {
  id: string;
  user_id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  valor_parcela: number;
  total_parcelas: number;
  parcelas_pagas: number;
  data_primeira_parcela: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
  tipo_financiamento?: string;
  instituicao_financeira?: string;
  loja?: string;
  finalidade?: string;
  taxa_juros?: number;
  debito_automatico?: boolean;
  valor_bem?: number;
  valor_entrada?: number;
  valor_financiado?: number;
  valor_emprestado?: number;
  margem_consignavel?: number;
  taxa_nominal_anual?: number;
  taxa_efetiva_anual?: number;
  ano_veiculo?: number;
  cartao_id?: string;
  status_manual?: string;
  status_manual_mes?: number;
  status_manual_ano?: number;
}

export type ContaParceladaInsert = Omit<ContaParcelada, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export type ContaParceladaCreate = Partial<ContaParceladaInsert> & {
  nome: string;
  valor_parcela: number;
  total_parcelas: number;
  data_primeira_parcela: string;
};

export interface ParcelaProjetada {
  mes: number;
  ano: number;
  valor: number;
  contas: {
    nome: string;
    valor: number;
    parcela_numero: number;
    total_parcelas: number;
  }[];
}

export const useContasParceladas = () => {
  const { user } = useAuth();
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  const { registerInvalidationCallback } = useRealtime();
  const { toast } = useToast();
  const [contas, setContas] = useState<ContaParcelada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const cacheKey = `contas_parceladas_${user.id}`;
      const cachedData = getFromCache<ContaParcelada[]>(cacheKey);
      
      if (cachedData) {
        setContas(cachedData);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('compromissos_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'conta_parcelada')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const contasData = (data || []).map(item => {
        const dadosEspecificos = item.dados_especificos as any;
        
        return {
          id: item.id,
          user_id: item.user_id,
          nome: item.nome,
          descricao: item.descricao,
          categoria: item.categoria,
          valor_parcela: item.valor_principal || 0,
          total_parcelas: item.total_parcelas || 0,
          parcelas_pagas: item.parcelas_pagas || 0,
          data_primeira_parcela: item.data_inicio || '',
          ativa: item.ativo,
          created_at: item.created_at,
          updated_at: item.updated_at,
          tipo_financiamento: dadosEspecificos?.tipo_financiamento,
          instituicao_financeira: dadosEspecificos?.instituicao_financeira,
          loja: dadosEspecificos?.loja,
          finalidade: dadosEspecificos?.finalidade,
          taxa_juros: dadosEspecificos?.taxa_juros,
          debito_automatico: dadosEspecificos?.debito_automatico,
          valor_bem: dadosEspecificos?.valor_bem,
          valor_entrada: dadosEspecificos?.valor_entrada,
          valor_financiado: dadosEspecificos?.valor_financiado,
          valor_emprestado: dadosEspecificos?.valor_emprestado,
          margem_consignavel: dadosEspecificos?.margem_consignavel,
          taxa_nominal_anual: dadosEspecificos?.taxa_nominal_anual,
          taxa_efetiva_anual: dadosEspecificos?.taxa_efetiva_anual,
          ano_veiculo: dadosEspecificos?.ano_veiculo,
          cartao_id: dadosEspecificos?.cartao_id,
          status_manual: item.status_manual,
          status_manual_mes: item.status_manual_mes,
          status_manual_ano: item.status_manual_ano
        } as ContaParcelada;
      });

      setContas(contasData);
      setCache(cacheKey, contasData);
    } catch (error) {
      console.error('Erro ao buscar contas parceladas:', error);
      setError('Erro ao carregar contas parceladas');
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar as contas parceladas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addConta = async (conta: ContaParceladaCreate) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('compromissos_financeiros')
        .insert({
          user_id: user.id,
          tipo_compromisso: 'conta_parcelada',
          nome: conta.nome,
          descricao: conta.descricao,
          categoria: conta.categoria,
          ativo: conta.ativa !== false,
          valor_principal: conta.valor_parcela,
          data_inicio: conta.data_primeira_parcela,
          total_parcelas: conta.total_parcelas,
          parcelas_pagas: conta.parcelas_pagas || 0,
          dados_especificos: {
            tipo_financiamento: conta.tipo_financiamento,
            instituicao_financeira: conta.instituicao_financeira,
            loja: conta.loja,
            finalidade: conta.finalidade,
            taxa_juros: conta.taxa_juros,
            debito_automatico: conta.debito_automatico,
            valor_bem: conta.valor_bem,
            valor_entrada: conta.valor_entrada,
            valor_financiado: conta.valor_financiado,
            valor_emprestado: conta.valor_emprestado,
            margem_consignavel: conta.margem_consignavel,
            taxa_nominal_anual: conta.taxa_nominal_anual,
            taxa_efetiva_anual: conta.taxa_efetiva_anual,
            ano_veiculo: conta.ano_veiculo,
            cartao_id: conta.cartao_id
          }
        })
        .select()
        .single();

      if (error) throw error;

      const cacheKey = `contas_parceladas_${user.id}`;
      invalidateCache(cacheKey);
      await fetchContas();
      
      toast({
        title: "✅ Conta Adicionada!",
        description: `${conta.nome} foi adicionada com sucesso.`
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar conta parcelada:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar a conta parcelada.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateConta = async (id: string, updates: Partial<ContaParcelada>) => {
    if (!user) return false;

    try {
      const updateData: any = {};
      
      if (updates.nome !== undefined) updateData.nome = updates.nome;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.categoria !== undefined) updateData.categoria = updates.categoria;
      if (updates.ativa !== undefined) updateData.ativo = updates.ativa;
      if (updates.valor_parcela !== undefined) updateData.valor_principal = updates.valor_parcela;
      if (updates.data_primeira_parcela !== undefined) updateData.data_inicio = updates.data_primeira_parcela;
      if (updates.total_parcelas !== undefined) updateData.total_parcelas = updates.total_parcelas;
      if (updates.parcelas_pagas !== undefined) updateData.parcelas_pagas = updates.parcelas_pagas;
      if (updates.status_manual !== undefined) updateData.status_manual = updates.status_manual;
      if (updates.status_manual_mes !== undefined) updateData.status_manual_mes = updates.status_manual_mes;
      if (updates.status_manual_ano !== undefined) updateData.status_manual_ano = updates.status_manual_ano;
      
      // Construir dados_especificos
      const dadosEspecificos: any = {};
      if (updates.tipo_financiamento !== undefined) dadosEspecificos.tipo_financiamento = updates.tipo_financiamento;
      if (updates.instituicao_financeira !== undefined) dadosEspecificos.instituicao_financeira = updates.instituicao_financeira;
      if (updates.loja !== undefined) dadosEspecificos.loja = updates.loja;
      if (updates.finalidade !== undefined) dadosEspecificos.finalidade = updates.finalidade;
      if (updates.taxa_juros !== undefined) dadosEspecificos.taxa_juros = updates.taxa_juros;
      if (updates.debito_automatico !== undefined) dadosEspecificos.debito_automatico = updates.debito_automatico;
      if (updates.valor_bem !== undefined) dadosEspecificos.valor_bem = updates.valor_bem;
      if (updates.valor_entrada !== undefined) dadosEspecificos.valor_entrada = updates.valor_entrada;
      if (updates.valor_financiado !== undefined) dadosEspecificos.valor_financiado = updates.valor_financiado;
      if (updates.valor_emprestado !== undefined) dadosEspecificos.valor_emprestado = updates.valor_emprestado;
      if (updates.margem_consignavel !== undefined) dadosEspecificos.margem_consignavel = updates.margem_consignavel;
      if (updates.taxa_nominal_anual !== undefined) dadosEspecificos.taxa_nominal_anual = updates.taxa_nominal_anual;
      if (updates.taxa_efetiva_anual !== undefined) dadosEspecificos.taxa_efetiva_anual = updates.taxa_efetiva_anual;
      if (updates.ano_veiculo !== undefined) dadosEspecificos.ano_veiculo = updates.ano_veiculo;
      if (updates.cartao_id !== undefined) dadosEspecificos.cartao_id = updates.cartao_id;
      
      if (Object.keys(dadosEspecificos).length > 0) {
        updateData.dados_especificos = dadosEspecificos;
      }

      const { error } = await supabase
        .from('compromissos_financeiros')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'conta_parcelada');

      if (error) throw error;

      const cacheKey = `contas_parceladas_${user.id}`;
      invalidateCache(cacheKey);
      await fetchContas();
      
      toast({
        title: "✅ Conta Atualizada!",
        description: "Conta parcelada atualizada com sucesso."
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar conta parcelada:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a conta parcelada.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteConta = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('compromissos_financeiros')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'conta_parcelada');

      if (error) throw error;

      const cacheKey = `contas_parceladas_${user.id}`;
      invalidateCache(cacheKey);
      await fetchContas();
      
      toast({
        title: "✅ Conta Removida!",
        description: "Conta parcelada removida com sucesso."
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover conta parcelada:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover a conta parcelada.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTotalParcelasAtivas = () => {
    return contas
      .filter(conta => conta.ativa)
      .reduce((total, conta) => total + conta.valor_parcela, 0);
  };

  const getContasAtivasComParcelas = () => {
    return contas.filter(conta => 
      conta.ativa && conta.parcelas_pagas < conta.total_parcelas
    );
  };

  const calcularParcelasRestantes = (conta: ContaParcelada) => {
    return Math.max(0, conta.total_parcelas - conta.parcelas_pagas);
  };

  const calcularValorRestante = (conta: ContaParcelada) => {
    const parcelasRestantes = calcularParcelasRestantes(conta);
    return parcelasRestantes * conta.valor_parcela;
  };

  const calcularDataTermino = (conta: ContaParcelada) => {
    const parcelasRestantes = calcularParcelasRestantes(conta);
    if (parcelasRestantes === 0) return null;
    
    const dataInicio = new Date(conta.data_primeira_parcela);
    const parcelasPassadas = conta.parcelas_pagas;
    const dataTermino = new Date(dataInicio);
    dataTermino.setMonth(dataTermino.getMonth() + parcelasPassadas + parcelasRestantes - 1);
    
    return dataTermino.toISOString().split('T')[0];
  };

  const atualizarParcelasPagas = async (id: string, parcelasPagas: number) => {
    return await updateConta(id, { parcelas_pagas: parcelasPagas });
  };

  const marcarParcelaComoPaga = async (id: string) => {
    const conta = contas.find(c => c.id === id);
    if (!conta) return false;
    
    const novasParcelasPagas = Math.min(conta.parcelas_pagas + 1, conta.total_parcelas);
    return await atualizarParcelasPagas(id, novasParcelasPagas);
  };

  const projetarParcelas = (mesesAFrente = 12): ParcelaProjetada[] => {
    const hoje = new Date();
    const projecoes: ParcelaProjetada[] = [];
    
    for (let i = 0; i < mesesAFrente; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      
      const contasDoMes = contas
        .filter(conta => conta.ativa)
        .map(conta => {
          const dataInicio = new Date(conta.data_primeira_parcela);
          const mesesDecorridos = (ano - dataInicio.getFullYear()) * 12 + (mes - dataInicio.getMonth() - 1);
          const parcelaNumero = mesesDecorridos + 1;
          
          if (parcelaNumero > conta.parcelas_pagas && parcelaNumero <= conta.total_parcelas) {
  const calcularParcelasProjetadas = projetarParcelas;
  const createConta = addConta;
  const getContasParceladasComStatus = (mes: number, ano: number) => contas;
  const updateStatusManualParcela = async (id: string, status: string, mes: number, ano: number) => {
    return await updateConta(id, { status_manual: status, status_manual_mes: mes, status_manual_ano: ano });
  };

  return {
              nome: conta.nome,
              valor: conta.valor_parcela,
              parcela_numero: parcelaNumero,
              total_parcelas: conta.total_parcelas
            };
          }
          return null;
        })
        .filter(Boolean) as any[];
      
      const valorTotal = contasDoMes.reduce((total, conta) => total + conta.valor, 0);
      
      projecoes.push({
        mes,
        ano,
        valor: valorTotal,
        contas: contasDoMes
      });
    }
    
    return projecoes;
  };

  useEffect(() => {
    if (user) {
      fetchContas();
    }
  }, [user]);

  // Setup realtime listener
  useEffect(() => {
    if (!user) return;

    const unregister = registerInvalidationCallback('compromissos_financeiros', () => {
      const cacheKey = `contas_parceladas_${user.id}`;
      invalidateCache(cacheKey);
      fetchContas();
    });

    return unregister;
  }, [user, registerInvalidationCallback]);

  return {
    contas,
    isLoading,
    error,
    addConta,
    updateConta,
    deleteConta,
    getTotalParcelasAtivas,
    getContasAtivasComParcelas,
    calcularParcelasRestantes,
    calcularValorRestante,
    calcularDataTermino,
    atualizarParcelasPagas,
    marcarParcelaComoPaga,
    projetarParcelas,
    calcularParcelasProjetadas,
    createConta,
    getContasParceladasComStatus,
    updateStatusManualParcela,
    refetch: fetchContas
  };
};