import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface PricingData {
  solo: {
    price: number;
    currency: string;
    interval: string;
  };
  casal: {
    price: number;
    currency: string;
    interval: string;
  };
}

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export const useStripe = () => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

  const fetchPricing = useCallback(async () => {
    try {
      setLoadingPricing(true);
      const { data, error } = await supabase.functions.invoke('get-pricing');
      
      if (error) throw error;
      setPricing(data);
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
      // Fallback para preços padrão (mesmos da função get-pricing)
      setPricing({
        solo: {
          price: 11.97,
          currency: "brl",
          interval: "month"
        },
        casal: {
          price: 14.97,
          currency: "brl",
          interval: "month"
        }
      });
    } finally {
      setLoadingPricing(false);
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingSubscription(true);
      console.log('🔄 Verificando status da assinatura...');
      
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error('❌ Erro ao verificar assinatura:', error);
        toast.error(error.message || "Erro ao verificar assinatura. Tente novamente.");
        return;
      }

      console.log('✅ Status atualizado:', data);
      setSubscriptionStatus(data as SubscriptionStatus);
      
      return data as SubscriptionStatus;
    } catch (e: any) {
      console.error('❌ Erro inesperado:', e);
      toast.error(e.message || "Erro ao verificar assinatura. Tente novamente.");
    } finally {
      setLoadingSubscription(false);
    }
  }, [user]);

  const handleCheckout = useCallback(async (plan: "solo" | "casal") => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer uma assinatura");
      return;
    }

    try {
      console.log('🚀 Iniciando checkout para plano:', plan);
      setCheckoutLoading(plan);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan }
      });
      
      console.log('📦 Resposta do checkout:', { data, error });
      
      if (error) throw error;
      
      if (data?.url) {
        console.log('🔗 URL recebida:', data.url);
        
        // Detectar se é mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('📱 É mobile?', isMobile);
        
        if (isMobile) {
          // No mobile, usar window.location.href para garantir que funcione
          console.log('📱 Redirecionando mobile para:', data.url);
          window.location.href = data.url;
        } else {
          // No desktop, abrir em nova aba
          console.log('💻 Abrindo em nova aba:', data.url);
          window.open(data.url, "_blank");
        }
      }
    } catch (e: any) {
      console.error('❌ Erro no checkout:', e);
      toast.error(e.message || "Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setCheckoutLoading(null);
    }
  }, [user]);

  const handlePortal = useCallback(async () => {
    if (!user) {
      toast.error("Você precisa estar logado para acessar o portal");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Erro ao abrir portal. Tente novamente.");
    }
  }, [user]);

  // Inicializar dados ao montar o hook
  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // Verificar assinatura quando usuário logado
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Verificar retorno de pagamento bem-sucedido
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    
    if ((success === '1' || sessionId) && user) {
      console.log('🎉 Retorno do pagamento detectado, forçando atualização...');
      // Force refresh subscription status after successful payment
      setTimeout(() => {
        checkSubscription().then((data) => {
          if (data?.subscribed) {
            toast.success(`Assinatura ativa! Seu plano ${data.subscription_tier} está ativo.`);
          }
        });
      }, 2000); // Wait 2 seconds for Stripe to process
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, checkSubscription]);

  return {
    pricing,
    subscriptionStatus,
    loadingPricing,
    loadingSubscription,
    checkoutLoading,
    formatPrice,
    fetchPricing,
    checkSubscription,
    handleCheckout,
    handlePortal
  };
};