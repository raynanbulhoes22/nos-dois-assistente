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
    console.log('useSubscription - checkSubscription called');
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      console.log('useSubscription - user:', user);
      if (!user.user) {
        console.log('useSubscription - no user found');
        setStatus({ subscribed: false });
        return;
      }

      console.log('useSubscription - calling check-subscription function');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('useSubscription - erro ao verificar plano:', error);
        setStatus({ subscribed: false });
        return;
      }

      console.log('useSubscription - function response:', data);
      setStatus(data);
    } catch (error) {
      console.error('useSubscription - erro inesperado:', error);
      setStatus({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  // Auto-check subscription on mount
  useEffect(() => {
    console.log('useSubscription - useEffect triggered');
    checkSubscription();
  }, []);

  return {
    status,
    loading,
    checkSubscription
  };
};