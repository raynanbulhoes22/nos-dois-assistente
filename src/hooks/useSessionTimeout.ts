import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useSessionTimeout = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Clear any corrupted session state on mount
    const clearCorruptedState = () => {
      try {
        sessionStorage.removeItem('session_expired');
        sessionStorage.removeItem('session_timeout_id');
        sessionStorage.removeItem('last_activity');
      } catch (error) {
        console.warn('Failed to clear session state:', error);
      }
    };

    clearCorruptedState();

    // Remove any existing problematic event listeners
    const removeProblematicListeners = () => {
      const events = ['sessionExpired', 'beforeunload', 'visibilitychange'];
      events.forEach(event => {
        const listeners = (window as any)._eventListeners?.[event] || [];
        listeners.forEach((listener: EventListener) => {
          window.removeEventListener(event, listener);
        });
      });
    };

    removeProblematicListeners();

    // Only rely on Supabase's native session management
    // No custom timeout logic that could conflict with React Router
    
  }, [user]);
};