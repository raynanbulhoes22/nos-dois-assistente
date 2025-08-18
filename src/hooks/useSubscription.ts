import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/production-logger';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    logger.info('Verificando status da assinatura');
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        logger.warn('Usuário não autenticado');
        setStatus({ subscribed: false });
        return;
      }

      logger.info('Chamando função de verificação de assinatura');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        logger.error('Erro ao verificar plano de assinatura', error);
        setStatus({ subscribed: false });
        return;
      }

      logger.info('Status da assinatura verificado com sucesso');
      setStatus(data);
    } catch (error) {
      logger.error('Erro inesperado ao verificar assinatura', error);
      setStatus({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  // Auto-check subscription on mount
  useEffect(() => {
    logger.info('Inicializando verificação de assinatura');
    checkSubscription();
  }, []);

  return {
    status,
    loading,
    checkSubscription
  };
};