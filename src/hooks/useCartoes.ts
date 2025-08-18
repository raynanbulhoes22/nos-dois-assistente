import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Cartao {
  id: string;
  user_id: string;
  apelido: string;
  ultimos_digitos: string;
  limite?: number;
  limite_disponivel?: string; // Corrigido: DB armazena como string
  dia_vencimento?: number;
  ativo: boolean;
  created_at: string;
}

export const useCartoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCartoes = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('cartoes_credito')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // @ts-ignore - Temporário: corrigir tipos depois
      setCartoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
      setError('Erro ao carregar cartões');
    } finally {
      setIsLoading(false);
    }
  };

  const addCartao = async (cartao: Omit<Cartao, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cartoes_credito')
        .insert({
          user_id: user.id,
          apelido: cartao.apelido,
          ultimos_digitos: cartao.ultimos_digitos,
          limite: cartao.limite,
          limite_disponivel: cartao.limite_disponivel, // Já é string na interface
          dia_vencimento: cartao.dia_vencimento,
          ativo: cartao.ativo
        });

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Cartão adicionado com sucesso!"
      });

      await fetchCartoes();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar o cartão.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateCartao = async (id: string, updates: Partial<Cartao>) => {
    try {
      // @ts-ignore - Temporário: corrigir tipos depois
      const { error } = await supabase
        .from('cartoes_credito')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Cartão atualizado com sucesso!"
      });

      await fetchCartoes();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar o cartão.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteCartao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cartoes_credito')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Cartão removido com sucesso!"
      });

      await fetchCartoes();
      return true;
    } catch (error) {
      console.error('Erro ao remover cartão:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover o cartão.",
        variant: "destructive"
      });
      return false;
    }
  };

  const findCartaoByFinal = (finalDigitos: string) => {
    return cartoes.find(cartao => 
      cartao.ultimos_digitos === finalDigitos && cartao.ativo
    );
  };

  const criarCartaoAutomatico = async (dadosCartao: { apelido: string; ultimos_digitos: string }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('cartoes_credito')
        .insert({
          user_id: user.id,
          apelido: dadosCartao.apelido,
          ultimos_digitos: dadosCartao.ultimos_digitos,
          limite: null,
          dia_vencimento: null,
          ativo: true
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      await fetchCartoes();
      
      return data;
    } catch (error) {
      console.error('Erro ao criar cartão automaticamente:', error);
      return null;
    }
  };

  const getTotalLimite = () => {
    return cartoes
      .filter(cartao => cartao.ativo && cartao.limite)
      .reduce((total, cartao) => total + (cartao.limite || 0), 0);
  };

  useEffect(() => {
    fetchCartoes();
  }, [user]);

  return {
    cartoes,
    isLoading,
    error,
    addCartao,
    updateCartao,
    deleteCartao,
    findCartaoByFinal,
    getTotalLimite,
    criarCartaoAutomatico,
    refetch: fetchCartoes
  };
};