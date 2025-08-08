import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setStatus({ subscribed: false });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Erro ao verificar plano:', error);
        setStatus({ subscribed: false });
        return;
      }

      setStatus(data);
    } catch (error) {
      console.error('Erro inesperado:', error);
      setStatus({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    checkSubscription
  };
};