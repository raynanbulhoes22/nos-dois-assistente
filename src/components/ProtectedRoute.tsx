import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, subscriptionStatus, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && subscriptionStatus !== null) {
      // If user has no active subscription and is not on the subscription page
      if (!subscriptionStatus.subscribed && location.pathname !== '/assinaturas') {
        navigate('/assinaturas', { replace: true });
      }
    }
  }, [loading, user, subscriptionStatus, location.pathname, navigate]);

  // Show loading while checking subscription
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no subscription and not on subscription page, don't render content
  if (user && subscriptionStatus && !subscriptionStatus.subscribed && location.pathname !== '/assinaturas') {
    return null;
  }

  return <>{children}</>;
};