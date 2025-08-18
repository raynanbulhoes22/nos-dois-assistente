import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSessionTimeout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = async () => {
      // Check if session actually expired
      const sessionExpired = sessionStorage.getItem('session_expired');
      
      if (sessionExpired === 'true') {
        sessionStorage.removeItem('session_expired');
        
        // Show user-friendly message
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou por inatividade. Faça login novamente.",
          variant: "destructive",
        });
        
        // Proper logout through Supabase
        await supabase.auth.signOut();
        
        // Navigate to home page
        navigate('/', { replace: true });
      }
    };

    // Listen for session expiration events
    window.addEventListener('sessionExpired', handleSessionExpired);
    
    // Check on mount in case the event was missed
    handleSessionExpired();

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, [navigate]);
};