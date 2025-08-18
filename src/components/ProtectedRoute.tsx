import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, subscriptionStatus, onboardingCompleted, loading } = useAuth();
  const navigationExecuted = useRef(false);

  useEffect(() => {
    // Reset navigation flag when route changes
    navigationExecuted.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && user && subscriptionStatus !== null && onboardingCompleted !== null && !navigationExecuted.current) {
      // If user has no active subscription and is not on the plan page
      if (!subscriptionStatus.subscribed && location.pathname !== '/assinaturas') {
        navigationExecuted.current = true;
        navigate('/assinaturas', { replace: true });
        return;
      }
      
      // If user has subscription but hasn't completed onboarding
      if (subscriptionStatus.subscribed && !onboardingCompleted && location.pathname !== '/primeiros-passos') {
        navigationExecuted.current = true;
        navigate('/primeiros-passos', { replace: true });
        return;
      }

      // If user has subscription and completed onboarding, redirect to dashboard
      if (subscriptionStatus.subscribed && onboardingCompleted && location.pathname === '/') {
        navigationExecuted.current = true;
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, user, subscriptionStatus, onboardingCompleted, location.pathname, navigate]);

  // Show loading while auth is still loading or subscription status is unknown
  if (loading || subscriptionStatus === null) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access to subscription page regardless of subscription status
  if (location.pathname === '/assinaturas') {
    return <>{children}</>;
  }

  // If no subscription, redirect to subscription page
  if (!subscriptionStatus?.subscribed) {
    navigate('/assinaturas', { replace: true });
    return null;
  }

  // If subscription exists but onboarding not completed, redirect to onboarding
  if (onboardingCompleted === false) {
    navigate('/primeiros-passos', { replace: true });
    return null;
  }

  return <>{children}</>;
};