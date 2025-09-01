import { useAuth } from './useAuth';

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  
  console.log('[Admin Auth] User:', user?.email, 'Loading:', loading);
  
  const isAdmin = user?.email === 'nosdois@teste.com';
  
  console.log('[Admin Auth] Is Admin:', isAdmin);
  
  return {
    isAdmin,
    user,
    loading
  };
};