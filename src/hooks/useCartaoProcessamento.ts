import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { processarTransacoesCartao, verificarAlertasCartao, TransacaoCartao } from '@/lib/cartao-management';
import { Cartao } from '@/hooks/useCartoes';

export const useCartaoProcessamento = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertasCartoes, setAlertasCartoes] = useState<string[]>([]);

  /**
   * Processa transações de cartão automaticamente
   */
  const processarTransacoes = async (
    transacoes: TransacaoCartao[],
    cartoes: Cartao[]
  ) => {
    if (!user || !transacoes.length || !cartoes.length) return;

    setIsProcessing(true);
    try {
      // Verificar se já foi processado nesta sessão
      const sessionKey = `card_processing_${user.id}_${new Date().toDateString()}`;
      const jaProcessado = sessionStorage.getItem(sessionKey);
      
      if (jaProcessado) {
        console.log('Transações de cartão já processadas hoje');
        return;
      }

      const resultado = await processarTransacoesCartao(transacoes, cartoes, user.id);
      
      if (resultado.processadas > 0) {
        toast({
          title: "💳 Transações processadas!",
          description: `${resultado.processadas} transação(s) de cartão processada(s) automaticamente.`
        });

        // Marcar como processado
        sessionStorage.setItem(sessionKey, 'true');
      }

      if (resultado.erros > 0) {
        console.warn(`${resultado.erros} erros ao processar transações de cartão`);
      }

    } catch (error) {
      console.error('Erro ao processar transações de cartão:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Verifica alertas de todos os cartões
   */
  const verificarAlertas = (cartoes: Cartao[]) => {
    const alertas: string[] = [];
    
    cartoes.forEach(cartao => {
      if (cartao.ativo) {
        const alertasCartao = verificarAlertasCartao(cartao);
        alertas.push(...alertasCartao);
      }
    });

    setAlertasCartoes(alertas);
    return alertas;
  };

  /**
   * Recalcula limite disponível para todos os cartões
   */
  const atualizarLimitesDisponiveis = async (
    cartoes: Cartao[],
    transacoes: TransacaoCartao[]
  ) => {
    if (!user) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      for (const cartao of cartoes) {
        if (!cartao.ativo) continue;

        // Se não tem limite_disponivel definido, calcular baseado nas transações
        if (cartao.limite_disponivel === null || cartao.limite_disponivel === undefined) {
          const { calcularLimiteDisponivel } = await import('@/lib/cartao-management');
          const limiteCalculado = calcularLimiteDisponivel(cartao, transacoes);

          await supabase
            .from('cartoes_credito')
            .update({ limite_disponivel: limiteCalculado.toString() } as any)
            .eq('id', cartao.id)
            .eq('user_id', user.id);

          console.log(`Limite disponível atualizado para cartão ${cartao.apelido}: R$ ${limiteCalculado.toFixed(2)}`);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar limites disponíveis:', error);
    }
  };

  return {
    isProcessing,
    alertasCartoes,
    processarTransacoes,
    verificarAlertas,
    atualizarLimitesDisponiveis
  };
};