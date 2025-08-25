import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PaymentAlert {
  id: string;
  type: 'payment_due' | 'payment_failed' | 'card_expiring' | 'subscription_ending';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionType?: 'update_payment' | 'contact_support' | 'renew_subscription';
  daysUntilAction?: number;
  amount?: number;
}

export const usePaymentAlerts = () => {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateAlerts = useCallback((subscriptionData: any): PaymentAlert[] => {
    const alertList: PaymentAlert[] = [];
    
    if (!subscriptionData) return alertList;

    const now = new Date();
    const {
      subscribed,
      subscription_end,
      payment_status,
      payment_error,
      next_billing_date,
      last_payment_attempt
    } = subscriptionData;

    // Alert for payment failures
    if (payment_status === 'failed' && payment_error) {
      alertList.push({
        id: 'payment_failed',
        type: 'payment_failed',
        priority: 'high',
        title: 'Falha no Pagamento',
        message: `Não foi possível processar seu pagamento. ${payment_error}`,
        actionType: 'update_payment'
      });
    }

    // Alert for upcoming payments (3 days before)
    if (next_billing_date && subscribed) {
      const billingDate = new Date(next_billing_date);
      const daysUntilBilling = Math.ceil((billingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilBilling <= 3 && daysUntilBilling > 0) {
        alertList.push({
          id: 'payment_due',
          type: 'payment_due',
          priority: 'medium',
          title: 'Cobrança Próxima',
          message: `Sua próxima cobrança será processada em ${daysUntilBilling} dia${daysUntilBilling !== 1 ? 's' : ''}.`,
          daysUntilAction: daysUntilBilling,
          actionType: 'update_payment'
        });
      }
    }

    // Alert for subscription ending soon (7 days before)
    if (subscription_end && subscribed) {
      const endDate = new Date(subscription_end);
      const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
        alertList.push({
          id: 'subscription_ending',
          type: 'subscription_ending',
          priority: 'medium',
          title: 'Assinatura Expirando',
          message: `Sua assinatura expira em ${daysUntilEnd} dia${daysUntilEnd !== 1 ? 's' : ''}.`,
          daysUntilAction: daysUntilEnd,
          actionType: 'renew_subscription'
        });
      }
    }

    // Alert for expired subscription
    if (subscription_end && !subscribed) {
      const endDate = new Date(subscription_end);
      if (endDate < now) {
        alertList.push({
          id: 'subscription_expired',
          type: 'subscription_ending',
          priority: 'high',
          title: 'Assinatura Expirada',
          message: 'Sua assinatura expirou. Renove para continuar usando todos os recursos.',
          actionType: 'renew_subscription'
        });
      }
    }

    return alertList;
  }, []);

  const checkPaymentAlerts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get subscription data from subscribers table
      const { data: subData, error: subError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription data:', subError);
        return;
      }

      // Check payment status via edge function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('payment-status');
      
      if (paymentError) {
        console.error('Error checking payment status:', paymentError);
      }

      // Combine local data with payment status
      const combinedData = {
        ...subData,
        ...paymentData
      };

      const generatedAlerts = generateAlerts(combinedData);
      setAlerts(generatedAlerts);
      
    } catch (error) {
      console.error('Error checking payment alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [user, generateAlerts]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Check alerts on mount and when user changes
  useEffect(() => {
    if (user) {
      checkPaymentAlerts();
    }
  }, [user, checkPaymentAlerts]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkPaymentAlerts();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, checkPaymentAlerts]);

  return {
    alerts,
    loading,
    checkPaymentAlerts,
    dismissAlert
  };
};