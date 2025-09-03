import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role, active')
          .eq('user_id', user.id)
          .eq('active', true)
          .single();

        if (error || !data) {
          console.log('[Admin Auth] User not found in admin_users table');
          setIsAdmin(false);
        } else {
          console.log('[Admin Auth] Admin user found:', data);
          setIsAdmin(data.role === 'super_admin');
        }
      } catch (error) {
        console.error('[Admin Auth] Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);
  
  return {
    isAdmin,
    user,
    loading: loading || adminLoading
  };
};