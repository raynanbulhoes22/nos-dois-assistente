import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from './useAdminAuth';

export interface CustomerData {
  id: string;
  email: string;
  nome: string;
  created_at: string;
  onboarding_completed: boolean;
  terms_accepted: boolean;
  terms_version: string;
  subscription?: {
    subscribed: boolean;
    subscription_tier: string;
    subscription_end: string;
    payment_status: string;
    stripe_customer_id: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  subscribedUsers: number;
  newUsersToday: number;
  monthlyRevenue: number;
  churnRate: number;
}

export const useAdminData = () => {
  const { isAdmin } = useAdminAuth();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!isAdmin) return;

    try {
      // Buscar profiles com dados de assinatura
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          nome,
          created_at,
          onboarding_completed,
          terms_accepted,
          terms_version
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar dados de assinatura para cada usuário
      const customersWithSubscriptions = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: subData } = await supabase
            .from('subscribers')
            .select('subscribed, subscription_tier, subscription_end, payment_status, stripe_customer_id')
            .eq('user_id', profile.id)
            .single();

          return {
            ...profile,
            subscription: subData
          };
        })
      );

      setCustomers(customersWithSubscriptions);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStats = async () => {
    if (!isAdmin) return;

    try {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Usuários com assinatura ativa
      const { count: subscribedUsers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      // Novos usuários hoje
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      setStats({
        totalUsers: totalUsers || 0,
        subscribedUsers: subscribedUsers || 0,
        newUsersToday: newUsersToday || 0,
        monthlyRevenue: 0, // TODO: calcular via Stripe
        churnRate: 0 // TODO: calcular taxa de cancelamento
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCustomers(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [isAdmin]);

  return {
    customers,
    stats,
    loading,
    error,
    refetch: () => {
      fetchCustomers();
      fetchStats();
    }
  };
};