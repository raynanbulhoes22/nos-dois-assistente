import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/lib/security';
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [verificationCompleted, setVerificationCompleted] = useState(false);

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
    // Prevent multiple simultaneous verifications
    if (subscriptionLoading || verificationCompleted) {
      return;
    }

    // Check if we already verified this session
    const sessionKey = `verified_${userEmail}_${userId}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    setSubscriptionLoading(true);
    try {
      const subscriptionData = await checkSubscription();
      
      if (subscriptionData) {
        setSubscriptionStatus(subscriptionData);
        
        // Check if this is first time user (no subscription record)
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
      
      // Mark verification as completed for this session
      sessionStorage.setItem(sessionKey, 'true');
      setVerificationCompleted(true);
    } catch (error) {
      secureLog.error('Erro ao verificar plano', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    secureLog.info('Inicializando auth listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        secureLog.info('Auth state changed', { event, sessionExists: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user?.email) {
          secureLog.info('User signed in, verifying subscription');
          // Defer subscription check to avoid blocking auth flow
          setTimeout(() => {
            verifySubscription(session.user.email!, session.user.id);
          }, 100);
        }
        
        if (event === 'SIGNED_OUT') {
          secureLog.info('User signed out');
          setLoading(false);
          setSubscriptionStatus(null);
          setOnboardingCompleted(null);
          setVerificationCompleted(false);
          localStorage.removeItem('redirect_to_subscription');
          // Clear session verification cache
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('verified_')) {
              sessionStorage.removeItem(key);
            }
          });
        }
        
        if (event === 'TOKEN_REFRESHED') {
          secureLog.info('Token refreshed');
        }
      }
    );

    // THEN check for existing session
    secureLog.info('Checking for existing session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        secureLog.error('Error getting session', error);
      } else {
        secureLog.info('Got session', { sessionExists: !!session });
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        verifySubscription(session.user.email, session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      secureLog.info('Cleaning up auth listener');
      subscription.unsubscribe();
    };
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