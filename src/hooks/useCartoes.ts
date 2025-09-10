import { useCompromissosFinanceiros, Cartao } from "@/hooks/useCompromissosFinanceiros";
import { useMemo, useCallback } from "react";
import { criarDataVencimento } from "@/lib/date-utils";

export type { Cartao } from "@/hooks/useCompromissosFinanceiros";

export const useCartoes = () => {
  const { compromissos, addCompromisso, updateCompromisso, deleteCompromisso, isLoading } = useCompromissosFinanceiros();
  
  // Filtrar cartões da lista de compromissos
  const cartoes = useMemo(() => 
    compromissos.filter(c => c.tipo_compromisso === 'cartao_credito') as Cartao[]
  , [compromissos]);

  const addCartao = useCallback(async (cartao: Omit<Cartao, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tipo_compromisso' | 'parcelas_pagas' | 'dados_especificos'>) => {
    const compromissoData = {
      tipo_compromisso: 'cartao_credito' as const,
      nome: cartao.apelido,
      valor_principal: cartao.limite,
      ativo: cartao.ativo,
      parcelas_pagas: 0,
      data_vencimento: cartao.dia_vencimento ? criarDataVencimento(cartao.dia_vencimento) : undefined,
      dados_especificos: {
        apelido: cartao.apelido,
        ultimos_digitos: cartao.ultimos_digitos,
        limite: cartao.limite,
        limite_disponivel: cartao.limite_disponivel || cartao.limite.toString()
      }
    };

    return addCompromisso(compromissoData);
  }, [addCompromisso]);

  const updateCartao = useCallback(async (id: string, updates: Partial<Cartao>) => {
    const updateData: any = {};
    
    if (updates.apelido) updateData.nome = updates.apelido;
    if (updates.limite !== undefined) updateData.valor_principal = updates.limite;
    if (updates.ativo !== undefined) updateData.ativo = updates.ativo;
    if (updates.dia_vencimento !== undefined) {
      updateData.data_vencimento = criarDataVencimento(updates.dia_vencimento);
    }

    // Atualizar dados específicos
    if (updates.apelido || updates.ultimos_digitos || updates.limite !== undefined || updates.limite_disponivel !== undefined) {
      updateData.dados_especificos = {
        apelido: updates.apelido,
        ultimos_digitos: updates.ultimos_digitos,
        limite: updates.limite,
        limite_disponivel: updates.limite_disponivel
      };
    }

    return updateCompromisso(id, updateData);
  }, [updateCompromisso]);

  const deleteCartao = useCallback(async (id: string) => {
    return deleteCompromisso(id);
  }, [deleteCompromisso]);

  const getTotalLimite = useCallback(() => {
    return cartoes.reduce((total, cartao) => {
      return total + (cartao.ativo ? cartao.limite : 0);
    }, 0);
  }, [cartoes]);

  return {
    cartoes,
    isLoading,
    addCartao,
    updateCartao,
    deleteCartao,
    getTotalLimite,
    refetch: () => Promise.resolve(),
    criarCartaoAutomatico: addCartao
  };
};