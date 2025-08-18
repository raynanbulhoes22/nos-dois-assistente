import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionRedirectProps {
  children: React.ReactNode;
}

export const SubscriptionRedirect = ({ children }: SubscriptionRedirectProps) => {
  const navigate = useNavigate();
  const { user, subscriptionStatus, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && subscriptionStatus !== null) {
      const shouldRedirect = localStorage.getItem('redirect_to_subscription');
      
      if (shouldRedirect === 'true' && !subscriptionStatus.subscribed) {
        localStorage.removeItem('redirect_to_subscription');
        navigate('/assinaturas', { replace: true });
      }
    }
  }, [loading, user, subscriptionStatus, navigate]);

  return <>{children}</>;
};