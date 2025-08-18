import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: any | null;
  onboardingCompleted: boolean | null;
  verifySubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  
  const initialized = useRef(false);
  const verificationInProgress = useRef(false);
  const verificationTimeout = useRef<NodeJS.Timeout>();

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

  const debouncedVerifySubscription = async (userEmail: string, userId: string) => {
    // Clear any existing timeout
    if (verificationTimeout.current) {
      clearTimeout(verificationTimeout.current);
    }

    // Prevent multiple verifications
    if (verificationInProgress.current) {
      return;
    }

    // Check if already verified in session
    const sessionKey = `verified_${userId}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    // Debounce the verification
    verificationTimeout.current = setTimeout(async () => {
      verificationInProgress.current = true;

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
        setSubscriptionStatus({ subscribed: false });
        setOnboardingCompleted(false);
      } finally {
        verificationInProgress.current = false;
      }
    }, 500); // 500ms debounce
  };

  const verifySubscription = async () => {
    if (user?.email && user?.id) {
      await debouncedVerifySubscription(user.email, user.id);
    }
  };

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    secureLog.info('Inicializando auth listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        secureLog.info('Auth state changed', { event, sessionExists: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setSubscriptionStatus(null);
          setOnboardingCompleted(null);
          localStorage.removeItem('redirect_to_subscription');
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('verified_')) {
              sessionStorage.removeItem(key);
            }
          });
        } else if (event === 'SIGNED_IN' && session?.user?.email && session?.user?.id) {
          await debouncedVerifySubscription(session.user.email, session.user.id);
        }
        
        setLoading(false);
      }
    );

    return () => {
      if (verificationTimeout.current) {
        clearTimeout(verificationTimeout.current);
      }
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    subscriptionStatus,
    onboardingCompleted,
    verifySubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};