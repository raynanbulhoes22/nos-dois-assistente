import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

  // Control flags to prevent multiple executions
  const hasVerifiedSubscription = useRef(false);
  const isVerifying = useRef(false);
  const subscriptionCache = useRef<{ data: any; timestamp: number } | null>(null);
  const processedUsers = useRef(new Set<string>());

  const checkSubscription = useCallback(async () => {
    // Check cache first (5 minutes TTL)
    if (subscriptionCache.current) {
      const cacheAge = Date.now() - subscriptionCache.current.timestamp;
      if (cacheAge < 5 * 60 * 1000) { // 5 minutes
        secureLog.info('Using cached subscription data');
        return subscriptionCache.current.data;
      }
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (!error && data) {
        // Cache the result
        subscriptionCache.current = {
          data,
          timestamp: Date.now()
        };
        return data;
      }
      return null;
    } catch (error) {
      secureLog.error('Erro ao verificar assinatura', error);
      return null;
    }
  }, []);

  const verifySubscription = useCallback(async (userEmail: string, userId: string) => {
    // Prevent multiple simultaneous executions for the same user
    const userKey = `${userId}_${userEmail}`;
    if (isVerifying.current || processedUsers.current.has(userKey)) {
      secureLog.info('Subscription verification already in progress or completed for user');
      return;
    }

    isVerifying.current = true;
    processedUsers.current.add(userKey);
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
      hasVerifiedSubscription.current = true;
    } catch (error) {
      secureLog.error('Erro ao verificar plano', error);
    } finally {
      setSubscriptionLoading(false);
      isVerifying.current = false;
    }
  }, [checkSubscription]);

  useEffect(() => {
    secureLog.info('Inicializando auth listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        secureLog.info('Auth state changed', { event, sessionExists: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user?.email && !hasVerifiedSubscription.current) {
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
          localStorage.removeItem('redirect_to_subscription');
          // Reset flags for next user
          hasVerifiedSubscription.current = false;
          isVerifying.current = false;
          processedUsers.current.clear();
          subscriptionCache.current = null;
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
      
      // Only verify subscription if we haven't done it yet and have a user
      if (session?.user?.email && !hasVerifiedSubscription.current) {
        verifySubscription(session.user.email, session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      secureLog.info('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [verifySubscription]);

  // Memoize the return object to prevent unnecessary re-renders
  const authData = useMemo(() => ({
    user,
    session,
    loading: loading || subscriptionLoading,
    subscriptionStatus,
    onboardingCompleted,
    verifySubscription: user?.email && user?.id && !hasVerifiedSubscription.current
      ? () => verifySubscription(user.email!, user.id)
      : () => Promise.resolve()
  }), [user, session, loading, subscriptionLoading, subscriptionStatus, onboardingCompleted, verifySubscription]);

  return authData;
};