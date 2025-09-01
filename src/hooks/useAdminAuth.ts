import { useAuth } from './useAuth';

export const useAdminAuth = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.email === 'nosdois@teste.com';
  
  return {
    isAdmin,
    user
  };
};