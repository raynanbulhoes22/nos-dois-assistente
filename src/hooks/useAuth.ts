import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (!error && data) {
        return data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return null;
    }
  };

  const verifySubscription = async (userEmail: string, userId: string) => {
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
    } catch (error) {
      console.error('Erro ao verificar plano:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useAuth - Inicializando auth listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔔 useAuth - Auth state changed:', { event, session: session?.user?.email });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user?.email) {
          console.log('✅ useAuth - User signed in, verifying subscription');
          // Defer subscription check to avoid blocking auth flow
          setTimeout(() => {
            verifySubscription(session.user.email!, session.user.id);
          }, 100);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 useAuth - User signed out');
          setLoading(false);
          setSubscriptionStatus(null);
          setOnboardingCompleted(null);
          localStorage.removeItem('redirect_to_subscription');
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 useAuth - Token refreshed');
        }
      }
    );

    // THEN check for existing session
    console.log('🔍 useAuth - Checking for existing session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ useAuth - Error getting session:', error);
      } else {
        console.log('📋 useAuth - Got session:', session?.user?.email || 'No session');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        verifySubscription(session.user.email, session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🧹 useAuth - Cleaning up auth listener');
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