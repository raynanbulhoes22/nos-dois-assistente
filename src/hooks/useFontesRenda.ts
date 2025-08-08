import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FonteRenda {
  id: string;
  user_id: string;
  tipo: string;
  valor: number;
  descricao?: string;
  ativa: boolean;
  created_at: string;
}

export const useFontesRenda = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fontes, setFontes] = useState<FonteRenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFontes = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('fontes_renda')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFontes(data || []);
    } catch (error) {
      console.error('Erro ao buscar fontes de renda:', error);
      setError('Erro ao carregar fontes de renda');
    } finally {
      setIsLoading(false);
    }
  };

  const addFonte = async (fonte: Omit<FonteRenda, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('fontes_renda')
        .insert({
          ...fonte,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fonte de renda adicionada com sucesso!"
      });

      await fetchFontes();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar fonte de renda:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar a fonte de renda.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateFonte = async (id: string, updates: Partial<FonteRenda>) => {
    try {
      const { error } = await supabase
        .from('fontes_renda')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fonte de renda atualizada com sucesso!"
      });

      await fetchFontes();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar fonte de renda:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a fonte de renda.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteFonte = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fontes_renda')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Fonte de renda removida com sucesso!"
      });

      await fetchFontes();
      return true;
    } catch (error) {
      console.error('Erro ao remover fonte de renda:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover a fonte de renda.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTotalRendaAtiva = () => {
    return fontes
      .filter(fonte => fonte.ativa)
      .reduce((total, fonte) => total + fonte.valor, 0);
  };

  useEffect(() => {
    fetchFontes();
  }, [user]);

  return {
    fontes,
    isLoading,
    error,
    addFonte,
    updateFonte,
    deleteFonte,
    refetch: fetchFontes,
    getTotalRendaAtiva
  };
};