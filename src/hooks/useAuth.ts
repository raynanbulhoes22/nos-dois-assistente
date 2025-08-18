import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/lib/security';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (!error && data) {
        return data;
      }
      return null;
    } catch (error) {
      secureLog.error('Erro ao verificar assinatura', error);
      return null;
    }
  };

  const verifySubscription = async (userEmail: string, userId: string) => {
    // Check if already verified in this session
    const sessionKey = `sub_verified_${userId}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    try {
      const subscriptionData = await checkSubscription();
      
      if (subscriptionData) {
        setSubscriptionStatus(subscriptionData);
        
        // Check if this is first time user
        const isFirstTime = !localStorage.getItem(`user_accessed_${userEmail}`);
        if (isFirstTime && !subscriptionData.subscribed) {
          localStorage.setItem('redirect_to_subscription', 'true');
        }
        localStorage.setItem(`user_accessed_${userEmail}`, 'true');
      }

      // Check onboarding completion
      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      setOnboardingCompleted(profileData?.onboarding_completed || false);
      
      // Mark as verified
      sessionStorage.setItem(sessionKey, 'true');
    } catch (error) {
      secureLog.error('Erro ao verificar plano', error);
      // Set defaults on error
      setSubscriptionStatus({ subscribed: false });
      setOnboardingCompleted(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Single auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        secureLog.info('Auth state changed', { event, sessionExists: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setSubscriptionStatus(null);
          setOnboardingCompleted(null);
          localStorage.removeItem('redirect_to_subscription');
          // Clear verification cache
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('sub_verified_')) {
              sessionStorage.removeItem(key);
            }
          });
        }
      }
    );

    // Check existing session once
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email && session?.user?.id) {
        await verifySubscription(session.user.email, session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    subscriptionStatus,
    onboardingCompleted,
    verifySubscription: () => user?.email && user?.id ? verifySubscription(user.email, user.id) : Promise.resolve()
  };
};