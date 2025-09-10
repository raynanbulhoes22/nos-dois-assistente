import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialCache } from "@/contexts/FinancialDataContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Cartao {
  id: string;
  user_id: string;
  apelido: string;
  ultimos_digitos: string;
  limite?: number;
  limite_disponivel?: string;
  dia_vencimento?: number;
  ativo: boolean;
  created_at: string;
}

export const useCartoes = () => {
  const { user } = useAuth();
  const { getFromCache, setCache, invalidateCache } = useFinancialCache();
  const { registerInvalidationCallback } = useRealtime();
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

      const cacheKey = `cartoes_${user.id}`;
      const cachedData = getFromCache<Cartao[]>(cacheKey);
      
      if (cachedData) {
        setCartoes(cachedData);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('compromissos_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'cartao_credito')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cartoesData = (data || []).map(item => {
        const dadosEspecificos = item.dados_especificos as any;
        
        return {
          id: item.id,
          user_id: item.user_id,
          apelido: item.nome,
          ultimos_digitos: dadosEspecificos?.ultimos_digitos || '',
          limite: item.valor_principal || 0,
          limite_disponivel: dadosEspecificos?.limite_disponivel,
          dia_vencimento: item.data_vencimento || 1,
          ativo: item.ativo,
          created_at: item.created_at
        } as Cartao;
      });

      setCartoes(cartoesData);
      setCache(cacheKey, cartoesData);
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
      setError('Erro ao carregar cartões');
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os cartões.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCartao = async (cartao: Omit<Cartao, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('compromissos_financeiros')
        .insert({
          user_id: user.id,
          tipo_compromisso: 'cartao_credito',
          nome: cartao.apelido,
          categoria: 'Cartão de Crédito',
          ativo: cartao.ativo,
          valor_principal: cartao.limite || 0,
          data_vencimento: cartao.dia_vencimento || 1,
          dados_especificos: {
            ultimos_digitos: cartao.ultimos_digitos,
            limite_disponivel: cartao.limite_disponivel
          }
        })
        .select()
        .single();

      if (error) throw error;

      const cacheKey = `cartoes_${user.id}`;
      invalidateCache(cacheKey);
      await fetchCartoes();
      
      toast({
        title: "✅ Cartão Adicionado!",
        description: `${cartao.apelido} foi adicionado com sucesso.`
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar o cartão.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateCartao = async (id: string, updates: Partial<Cartao>) => {
    if (!user) return false;

    try {
      const updateData: any = {};
      
      if (updates.apelido !== undefined) updateData.nome = updates.apelido;
      if (updates.ativo !== undefined) updateData.ativo = updates.ativo;
      if (updates.limite !== undefined) updateData.valor_principal = updates.limite;
      if (updates.dia_vencimento !== undefined) updateData.data_vencimento = updates.dia_vencimento;
      
      // Construir dados_especificos
      const dadosEspecificos: any = {};
      if (updates.ultimos_digitos !== undefined) dadosEspecificos.ultimos_digitos = updates.ultimos_digitos;
      if (updates.limite_disponivel !== undefined) dadosEspecificos.limite_disponivel = updates.limite_disponivel;
      
      if (Object.keys(dadosEspecificos).length > 0) {
        updateData.dados_especificos = dadosEspecificos;
      }

      const { error } = await supabase
        .from('compromissos_financeiros')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'cartao_credito');

      if (error) throw error;

      const cacheKey = `cartoes_${user.id}`;
      invalidateCache(cacheKey);
      await fetchCartoes();
      
      toast({
        title: "✅ Cartão Atualizado!",
        description: "Cartão atualizado com sucesso."
      });

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
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('compromissos_financeiros')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('tipo_compromisso', 'cartao_credito');

      if (error) throw error;

      const cacheKey = `cartoes_${user.id}`;
      invalidateCache(cacheKey);
      await fetchCartoes();
      
      toast({
        title: "✅ Cartão Removido!",
        description: "Cartão removido com sucesso."
      });

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
        .from('compromissos_financeiros')
        .insert({
          user_id: user.id,
          tipo_compromisso: 'cartao_credito',
          nome: dadosCartao.apelido,
          categoria: 'Cartão de Crédito',
          ativo: true,
          valor_principal: 0,
          data_vencimento: 1,
          dados_especificos: {
            ultimos_digitos: dadosCartao.ultimos_digitos,
            limite_disponivel: null
          }
        })
        .select()
        .single();

      if (error) throw error;

      const cacheKey = `cartoes_${user.id}`;
      invalidateCache(cacheKey);
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
    if (user) {
      fetchCartoes();
    }
  }, [user]);

  // Setup realtime listener
  useEffect(() => {
    if (!user) return;

    const unregister = registerInvalidationCallback('compromissos_financeiros', () => {
      const cacheKey = `cartoes_${user.id}`;
      invalidateCache(cacheKey);
      fetchCartoes();
    });

    return unregister;
  }, [user, registerInvalidationCallback]);

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