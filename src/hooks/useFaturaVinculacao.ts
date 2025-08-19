import { useState, useCallback } from "react";
import { useFaturasFuturas } from "@/hooks/useFaturasFuturas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useFaturaVinculacao = () => {
  const { faturas, refetch } = useFaturasFuturas();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Buscar faturas futuras que podem ser vinculadas a um pagamento
  const getFaturasPossiveis = useCallback((valor: number, cartaoFinal?: string, data?: string) => {
    return faturas.filter(fatura => {
      const valorProximo = Math.abs(fatura.valor - valor) <= (valor * 0.1); // 10% de tolerância
      const cartaoMatch = !cartaoFinal || fatura.ultimos_digitos === cartaoFinal;
      
      if (data) {
        const dataFatura = new Date(fatura.data);
        const dataPagamento = new Date(data);
        const diferencaDias = Math.abs(dataFatura.getTime() - dataPagamento.getTime()) / (1000 * 60 * 60 * 24);
        const dataProxima = diferencaDias <= 15; // 15 dias de tolerância
        return valorProximo && cartaoMatch && dataProxima;
      }
      
      return valorProximo && cartaoMatch;
    });
  }, [faturas]);

  // Marcar fatura futura como paga (convertê-la em transação real)
  const marcarFaturaComoPaga = useCallback(async (faturaId: string, transacaoRealId: string) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      // 1. Atualizar a fatura futura marcando como "paga"
      const { error: updateError } = await supabase
        .from('registros_financeiros')
        .update({
          origem: 'fatura_paga',
          observacao: `Vinculada ao pagamento real (ID: ${transacaoRealId})`
        })
        .eq('id', faturaId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "✅ Fatura vinculada!",
        description: "A fatura futura foi marcada como paga."
      });

      await refetch();
      return true;
    } catch (error) {
      console.error('Erro ao marcar fatura como paga:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível vincular a fatura.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, refetch]);

  // Auto-vincular fatura se houver match automático
  const tentarVinculacaoAutomatica = useCallback(async (transacao: {
    id: string;
    valor: number;
    cartao_final?: string;
    data: string;
    forma_pagamento?: string;
  }) => {
    if (transacao.forma_pagamento !== 'cartao_credito') return false;

    const faturasPossiveis = getFaturasPossiveis(
      transacao.valor, 
      transacao.cartao_final, 
      transacao.data
    );

    // Se há apenas uma fatura possível com match exato, vincular automaticamente
    if (faturasPossiveis.length === 1) {
      const fatura = faturasPossiveis[0];
      const matchExato = fatura.valor === transacao.valor && 
                        fatura.ultimos_digitos === transacao.cartao_final;
      
      if (matchExato) {
        return await marcarFaturaComoPaga(fatura.id, transacao.id);
      }
    }

    return false;
  }, [getFaturasPossiveis, marcarFaturaComoPaga]);

  return {
    getFaturasPossiveis,
    marcarFaturaComoPaga,
    tentarVinculacaoAutomatica,
    isLoading
  };
};