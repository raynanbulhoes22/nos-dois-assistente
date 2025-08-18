import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCache } from "@/contexts/FinancialDataContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OrcamentoMensal {
  id: string;
  user_id: string;
  mes: number;
  ano: number;
  saldo_inicial?: number;
  meta_economia?: number;
  saldo_editado_manualmente?: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrcamentoCategoria {
  id: string;
  orcamento_id: string;
  categoria_nome: string;
  valor_orcado: number;
  created_at: string;
  updated_at: string;
}

export const useOrcamentos = () => {
  const { user } = useAuth();
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  const { toast } = useToast();
  const [orcamentos, setOrcamentos] = useState<OrcamentoMensal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrcamentos = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const cacheKey = `orcamentos_${user.id}`;
      const cachedData = getFromCache<OrcamentoMensal[]>(cacheKey);
      
      if (cachedData) {
        setOrcamentos(cachedData);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orcamentos_mensais')
        .select('*')
        .eq('user_id', user.id)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error) throw error;
      const orcamentosData = data || [];
      setOrcamentos(orcamentosData);
      setCache(cacheKey, orcamentosData, 10 * 60 * 1000); // Cache for 10 minutes
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
      setError('Erro ao carregar orçamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrcamentoAtual = () => {
    const now = new Date();
    const mesAtual = now.getMonth() + 1;
    const anoAtual = now.getFullYear();
    
    return orcamentos.find(o => o.mes === mesAtual && o.ano === anoAtual);
  };

  const getOrcamentoByMesAno = (mes: number, ano: number) => {
    return orcamentos.find(o => o.mes === mes && o.ano === ano);
  };

  const createOrcamento = async (orcamento: Omit<OrcamentoMensal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('orcamentos_mensais')
        .insert({
          ...orcamento,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setOrcamentos(prev => [data, ...prev]);
      invalidateCache(`orcamentos_${user.id}`);
      toast({
        title: "✅ Sucesso!",
        description: "Orçamento criado com sucesso!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao criar orçamento:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível criar o orçamento.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateOrcamento = async (id: string, updates: Partial<OrcamentoMensal>) => {
    try {
      const { data, error } = await supabase
        .from('orcamentos_mensais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOrcamentos(prev => prev.map(o => o.id === id ? data : o));
      invalidateCache(`orcamentos_${user.id}`);
      toast({
        title: "✅ Sucesso!",
        description: "Orçamento atualizado com sucesso!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar o orçamento.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteOrcamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos_mensais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrcamentos(prev => prev.filter(o => o.id !== id));
      invalidateCache(`orcamentos_${user.id}`);
      toast({
        title: "✅ Sucesso!",
        description: "Orçamento deletado com sucesso!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao deletar orçamento:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível deletar o orçamento.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchOrcamentos();
  }, [user]);

  return {
    orcamentos,
    isLoading,
    error,
    getOrcamentoAtual,
    getOrcamentoByMesAno,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    refetch: fetchOrcamentos
  };
};