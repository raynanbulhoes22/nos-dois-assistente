import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription, SubscriptionStatus } from './useSubscription';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const { checkSubscription } = useSubscription();

  const verifySubscription = async (userEmail: string, userId: string) => {
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (!error && data) {
        setSubscriptionStatus(data);
        
        // Check if this is first time user (no subscription record)
        const isFirstTime = !localStorage.getItem(`user_accessed_${userEmail}`);
        if (isFirstTime && !data.subscribed) {
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
    } catch (error) {
      console.error('Erro ao verificar plano:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user?.email) {
          // Defer subscription check to avoid blocking auth flow
          setTimeout(() => {
            verifySubscription(session.user.email!, session.user.id);
          }, 100);
        }
        
        if (event === 'SIGNED_OUT') {
          setLoading(false);
          setSubscriptionStatus(null);
          setOnboardingCompleted(null);
          localStorage.removeItem('redirect_to_subscription');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        verifySubscription(session.user.email, session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading: loading || subscriptionLoading,
    subscriptionStatus,
    onboardingCompleted,
    verifySubscription: () => user?.email && user?.id ? verifySubscription(user.email, user.id) : Promise.resolve()
  };
};