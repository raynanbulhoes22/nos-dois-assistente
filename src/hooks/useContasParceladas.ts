import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface ContaParcelada {
  id: string;
  user_id: string;
  nome: string;
  valor_parcela: number;
  total_parcelas: number;
  parcelas_pagas: number;
  data_primeira_parcela: string;
  categoria?: string;
  cartao_id?: string;
  descricao?: string;
  instituicao_financeira?: string;
  taxa_juros?: number;
  debito_automatico: boolean;
  tipo_financiamento: string;
  ativa: boolean;
  dados_especificos?: Json;
  created_at: string;
  updated_at: string;
}

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

  const createConta = async (conta: Omit<ContaParcelada, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
    refetch: fetchContas
  };
};