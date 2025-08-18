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

  // Show loading while checking plan
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no subscription and not on plan page, don't render content
  if (user && subscriptionStatus && !subscriptionStatus.subscribed && location.pathname !== '/assinaturas') {
    return null;
  }

  // If has subscription but no onboarding and not on onboarding page, don't render content
  if (user && subscriptionStatus?.subscribed && onboardingCompleted === false && location.pathname !== '/primeiros-passos') {
    return null;
  }

  return <>{children}</>;
};