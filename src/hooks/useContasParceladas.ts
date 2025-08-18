import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

// Use Supabase generated types for perfect sync with database
export type ContaParcelada = Database['public']['Tables']['contas_parceladas']['Row'];
export type ContaParceladaInsert = Database['public']['Tables']['contas_parceladas']['Insert'];

// Type for creating new accounts with flexible optional fields
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
      const { data, error } = await supabase
        .from('contas_parceladas')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      setContas((data || []) as ContaParcelada[]);
    } catch (err) {
      console.error('Erro ao buscar contas parceladas:', err);
      setError('Erro ao carregar contas parceladas');
    } finally {
      setIsLoading(false);
    }
  };

  const createConta = async (conta: ContaParceladaCreate) => {
    try {
      const { data, error } = await supabase
        .from('contas_parceladas')
        .insert({ ...conta, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;

      setContas(prev => [...prev, data as ContaParcelada]);
      toast({
        title: "✅ Sucesso!",
        description: "Conta parcelada adicionada!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao criar conta parcelada:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar a conta parcelada.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateConta = async (id: string, updates: Partial<ContaParcelada>) => {
    try {
      const { data, error } = await supabase
        .from('contas_parceladas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContas(prev => prev.map(c => c.id === id ? data as ContaParcelada : c));
      toast({
        title: "✅ Sucesso!",
        description: "Conta parcelada atualizada!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao atualizar conta parcelada:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a conta parcelada.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteConta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_parceladas')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;

      setContas(prev => prev.filter(c => c.id !== id));
      toast({
        title: "✅ Sucesso!",
        description: "Conta parcelada removida!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao deletar conta parcelada:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover a conta parcelada.",
        variant: "destructive"
      });
      return false;
    }
  };

  const calcularParcelasProjetadas = (mesesAFrente: number = 6): ParcelaProjetada[] => {
    const hoje = new Date();
    const projecoes: ParcelaProjetada[] = [];

    for (let i = 0; i < mesesAFrente; i++) {
      const mesProjecao = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mesNum = mesProjecao.getMonth() + 1;
      const anoNum = mesProjecao.getFullYear();
      
      const contasDoMes = contas.filter(conta => {
        const dataPrimeira = new Date(conta.data_primeira_parcela);
        const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
        
        if (parcelasRestantes <= 0) return false;
        
        const mesesDecorridos = (mesProjecao.getFullYear() - dataPrimeira.getFullYear()) * 12 + 
                               (mesProjecao.getMonth() - dataPrimeira.getMonth());
        
        const parcelaAtual = mesesDecorridos + 1;
        return parcelaAtual > 0 && parcelaAtual <= conta.total_parcelas && parcelaAtual > conta.parcelas_pagas;
      }).map(conta => {
        const dataPrimeira = new Date(conta.data_primeira_parcela);
        const mesesDecorridos = (mesProjecao.getFullYear() - dataPrimeira.getFullYear()) * 12 + 
                               (mesProjecao.getMonth() - dataPrimeira.getMonth());
        const parcelaAtual = mesesDecorridos + 1;
        
        return {
          nome: conta.nome,
          valor: conta.valor_parcela,
          parcela_numero: parcelaAtual,
          total_parcelas: conta.total_parcelas
        };
      });

      projecoes.push({
        mes: mesNum,
        ano: anoNum,
        valor: contasDoMes.reduce((total, conta) => total + conta.valor, 0),
        contas: contasDoMes
      });
    }

    return projecoes;
  };

  const getTotalParcelasAtivas = () => {
    return contas.filter(conta => {
      const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
      return parcelasRestantes > 0;
    }).reduce((total, conta) => total + conta.valor_parcela, 0);
  };

  const checkPagamentoParcela = async (conta: ContaParcelada, mes: number, ano: number) => {
    if (!user) return null;

    try {
      // Categorias relacionadas a financiamentos e parcelamentos
      const categoriasRelacionadas: { [key: string]: string[] } = {
        'parcelamento': ['Parcelamento', 'Financiamento', 'Prestação', 'Parcela'],
        'financiamento_veiculo': ['Financiamento', 'Veículo', 'Carro', 'Moto', 'Automóvel'],
        'financiamento_imovel': ['Financiamento', 'Imóvel', 'Casa', 'Apartamento', 'CEF', 'Caixa'],
        'emprestimo_pessoal': ['Empréstimo', 'Crédito Pessoal', 'Financiamento'],
        'consorcio': ['Consórcio'],
        'outros': ['Financiamento', 'Parcelamento', 'Prestação']
      };

      // Palavras-chave para busca por nome
      const palavrasChave: { [key: string]: string[] } = {
        'financiamento': ['Financiamento', 'Parcelamento'],
        'consorcio': ['Consórcio'],
        'emprestimo': ['Empréstimo', 'Financiamento'],
        'prestacao': ['Financiamento', 'Parcelamento'],
        'parcela': ['Parcelamento', 'Financiamento'],
        'caixa': ['Financiamento'],
        'banco': ['Financiamento', 'Empréstimo'],
        'santander': ['Financiamento', 'Empréstimo'],
        'itau': ['Financiamento', 'Empréstimo'],
        'bradesco': ['Financiamento', 'Empréstimo']
      };

      // Determinar categorias para buscar
      let categoriasParaBuscar = categoriasRelacionadas[conta.tipo_financiamento] || [];
      
      // Buscar por palavras-chave no nome
      const nomeConta = conta.nome.toLowerCase();
      for (const [palavra, categorias] of Object.entries(palavrasChave)) {
        if (nomeConta.includes(palavra)) {
          categoriasParaBuscar = [...categoriasParaBuscar, ...categorias];
        }
      }
      
      // Remover duplicatas e adicionar fallbacks
      categoriasParaBuscar = [...new Set(categoriasParaBuscar)];
      if (categoriasParaBuscar.length === 0) {
        categoriasParaBuscar = ['Financiamento', 'Parcelamento'];
      }

      // 1. Buscar por categorias
      const { data, error } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .in('categoria', categoriasParaBuscar)
        .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);

      if (error) throw error;

      let registrosEncontrados = data || [];

      // 2. Buscar por estabelecimento/nome similar
      if (registrosEncontrados.length === 0) {
        const { data: dataByName, error: errorByName } = await supabase
          .from('registros_financeiros')
          .select('*')
          .eq('user_id', user.id)
          .or(`estabelecimento.ilike.%${conta.nome}%,nome.ilike.%${conta.nome}%,titulo.ilike.%${conta.nome}%`)
          .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`);
        
        if (!errorByName) {
          registrosEncontrados = dataByName || [];
        }
      }

      // 3. Buscar por valor similar
      if (registrosEncontrados.length === 0) {
        const valorParcela = Number(conta.valor_parcela);
        const tolerancia = valorParcela * 0.1;

        const { data: dataByValue, error: errorByValue } = await supabase
          .from('registros_financeiros')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
          .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`)
          .gte('valor', -(valorParcela + tolerancia))
          .lte('valor', -(valorParcela - tolerancia));
        
        if (!errorByValue) {
          registrosEncontrados = dataByValue || [];
        }
      }

      // Verificar se algum registro tem valor similar (±15%)
      const valorParcela = Number(conta.valor_parcela);
      const tolerancia = valorParcela * 0.15;
      
      const registroMatch = registrosEncontrados.find(registro => {
        const valorRegistro = Math.abs(Number(registro.valor));
        const diferenca = Math.abs(valorRegistro - valorParcela);
        return diferenca <= tolerancia;
      });

      return registroMatch || null;
    } catch (err) {
      console.error('Erro ao verificar pagamento da parcela:', err);
      return null;
    }
  };

  const updateStatusManualParcela = async (id: string, status: 'pago' | 'pendente', mes: number, ano: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contas_parceladas')
        .update({
          status_manual: status,
          status_manual_mes: mes,
          status_manual_ano: ano
        } as any)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (err) {
      console.error('Erro ao atualizar status manual da parcela:', err);
      throw err;
    }
  };

  const getContasParceladasComStatus = async (mes: number, ano: number) => {
    const contasAtivas = contas.filter(conta => {
      const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
      return parcelasRestantes > 0;
    });
    
    const contasComStatus = await Promise.all(
      contasAtivas.map(async (conta: any) => {
        // Verificar se tem status manual para este mês/ano
        const temStatusManual = conta.status_manual && 
                               conta.status_manual_mes === mes && 
                               conta.status_manual_ano === ano;

        let pago = false;
        let registroDetectado = null;
        let statusTipo = 'automatico';

        if (temStatusManual) {
          pago = conta.status_manual === 'pago';
          statusTipo = 'manual';
        } else {
          registroDetectado = await checkPagamentoParcela(conta, mes, ano);
          pago = !!registroDetectado;
        }

        return {
          ...conta,
          pago,
          registroDetectado,
          statusTipo
        };
      })
    );

    return contasComStatus;
  };

  useEffect(() => {
    fetchContas();
  }, [user]);

  return {
    contas,
    isLoading,
    error,
    createConta,
    updateConta,
    deleteConta,
    calcularParcelasProjetadas,
    getTotalParcelasAtivas,
    getContasParceladasComStatus,
    updateStatusManualParcela,
    refetch: fetchContas
  };
};