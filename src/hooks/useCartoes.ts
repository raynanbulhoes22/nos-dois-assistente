import { useCompromissosFinanceiros, Cartao } from "@/hooks/useCompromissosFinanceiros";
import { useMemo, useCallback } from "react";
import { criarDataVencimento } from "@/lib/date-utils";

export type { Cartao } from "@/hooks/useCompromissosFinanceiros";

export const useCartoes = () => {
  const { cartoes, addCompromisso, updateCompromisso, deleteCompromisso, isLoading } = useCompromissosFinanceiros();
  
  // Usar diretamente os cartões já transformados do useCompromissosFinanceiros

  const addCartao = useCallback(async (cartao: {
    nome?: string;
    apelido: string;
    ultimos_digitos: string;
    limite: number;
    limite_disponivel?: string | number;
    ativo: boolean;
    dia_vencimento?: number;
  }) => {
    const compromissoData = {
      tipo_compromisso: 'cartao_credito' as const,
      nome: cartao.nome || cartao.apelido,
      valor_principal: cartao.limite,
      ativo: cartao.ativo,
      parcelas_pagas: 0,
      data_vencimento: cartao.dia_vencimento ? criarDataVencimento(cartao.dia_vencimento) : undefined,
      dados_especificos: {
        apelido: cartao.apelido,
        ultimos_digitos: cartao.ultimos_digitos,
        limite: cartao.limite,
        limite_disponivel: cartao.limite_disponivel?.toString() || cartao.limite.toString()
      }
    };

    return addCompromisso(compromissoData);
  }, [addCompromisso]);

  const updateCartao = useCallback(async (id: string, updates: {
    nome?: string;
    apelido?: string;
    ultimos_digitos?: string;
    limite?: number;
    limite_disponivel?: string | number;
    ativo?: boolean;
    dia_vencimento?: number;
  }) => {
    const updateData: any = {};
    
    if (updates.nome) updateData.nome = updates.nome;
    if (updates.apelido) updateData.nome = updates.apelido;
    if (updates.limite !== undefined) updateData.valor_principal = updates.limite;
    if (updates.ativo !== undefined) updateData.ativo = updates.ativo;
    if (updates.dia_vencimento !== undefined) {
      updateData.data_vencimento = criarDataVencimento(updates.dia_vencimento);
    }

    // Atualizar dados específicos sempre que houver mudanças relevantes
    const cartaoAtual = cartoes.find(c => c.id === id);
    if (cartaoAtual) {
      updateData.dados_especificos = {
        apelido: updates.apelido || cartaoAtual.apelido,
        ultimos_digitos: updates.ultimos_digitos || cartaoAtual.ultimos_digitos,
        limite: updates.limite !== undefined ? updates.limite : cartaoAtual.limite,
        limite_disponivel: updates.limite_disponivel?.toString() || cartaoAtual.limite_disponivel
      };
    }

    return updateCompromisso(id, updateData);
  }, [updateCompromisso, cartoes]);

  const deleteCartao = useCallback(async (id: string) => {
    return deleteCompromisso(id);
  }, [deleteCompromisso]);

  const getTotalLimite = useCallback(() => {
    return cartoes.reduce((total, cartao) => {
      const limite = Number(cartao.limite) || 0;
      return total + (cartao.ativo ? limite : 0);
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