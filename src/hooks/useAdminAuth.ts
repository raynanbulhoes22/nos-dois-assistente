import { useAuth } from './useAuth';

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  
  console.log('[Admin Auth] User:', user?.email, 'Loading:', loading);
  console.log('[Admin Auth] Full user:', user);
  
  const isAdmin = user?.email === 'nosdois@teste.com';
  
  console.log('[Admin Auth] Is Admin:', isAdmin);
  console.log('[Admin Auth] Expected email: nosdois@teste.com');
  
  return {
    isAdmin,
    user,
    loading
  };
};