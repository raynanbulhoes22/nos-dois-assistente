import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OrcamentoCategoria {
  id: string;
  orcamento_id: string;
  categoria_nome: string;
  valor_orcado: number;
  created_at: string;
  updated_at: string;
}

export const useOrcamentoCategorias = (orcamentoId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<OrcamentoCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    if (!user || !orcamentoId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orcamentos_categorias')
        .select('*')
        .eq('orcamento_id', orcamentoId)
        .order('categoria_nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error('Erro ao buscar categorias do orçamento:', err);
      setError('Erro ao carregar categorias do orçamento');
    } finally {
      setIsLoading(false);
    }
  };

  const createCategoria = async (categoria: Omit<OrcamentoCategoria, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('orcamentos_categorias')
        .insert(categoria)
        .select()
        .single();

      if (error) throw error;

      setCategorias(prev => [...prev, data]);
      toast({
        title: "✅ Sucesso!",
        description: "Categoria adicionada ao orçamento!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao criar categoria do orçamento:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar a categoria.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateCategoria = async (id: string, updates: Partial<OrcamentoCategoria>) => {
    try {
      const { data, error } = await supabase
        .from('orcamentos_categorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategorias(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "✅ Sucesso!",
        description: "Categoria atualizada!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao atualizar categoria do orçamento:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteCategoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos_categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategorias(prev => prev.filter(c => c.id !== id));
      toast({
        title: "✅ Sucesso!",
        description: "Categoria removida do orçamento!"
      });
      return true;
    } catch (err) {
      console.error('Erro ao deletar categoria do orçamento:', err);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover a categoria.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTotalOrcado = () => {
    return categorias.reduce((total, categoria) => total + categoria.valor_orcado, 0);
  };

  useEffect(() => {
    fetchCategorias();
  }, [user, orcamentoId]);

  return {
    categorias,
    isLoading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getTotalOrcado,
    refetch: fetchCategorias
  };
};