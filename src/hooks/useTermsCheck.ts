import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/lib/security';

const CURRENT_TERMS_VERSION = "2.0";

interface TermsStatus {
  needsAcceptance: boolean;
  currentVersion: string | null;
  userVersion: string | null;
  loading: boolean;
}

export const useTermsCheck = () => {
  const { user } = useAuth();
  const [termsStatus, setTermsStatus] = useState<TermsStatus>({
    needsAcceptance: false,
    currentVersion: CURRENT_TERMS_VERSION,
    userVersion: null,
    loading: true
  });

  const checkTermsStatus = async () => {
    if (!user?.id) {
      setTermsStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('terms_accepted, terms_version, terms_accepted_at')
        .eq('id', user.id)
        .single();

      if (error) {
        secureLog.error('Erro ao verificar status dos termos:', error);
        setTermsStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const userVersion = profile?.terms_version || null;
      const needsAcceptance = !profile?.terms_accepted || 
                             userVersion !== CURRENT_TERMS_VERSION;

      setTermsStatus({
        needsAcceptance,
        currentVersion: CURRENT_TERMS_VERSION,
        userVersion,
        loading: false
      });

      secureLog.info('Status dos termos verificado', {
        userVersion,
        currentVersion: CURRENT_TERMS_VERSION,
        needsAcceptance
      });

    } catch (error) {
      secureLog.error('Erro ao verificar termos:', error);
      setTermsStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const acceptNewTerms = async () => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          terms_version: CURRENT_TERMS_VERSION
        })
        .eq('id', user.id);

      if (error) {
        secureLog.error('Erro ao aceitar novos termos:', error);
        return false;
      }

      setTermsStatus(prev => ({
        ...prev,
        needsAcceptance: false,
        userVersion: CURRENT_TERMS_VERSION
      }));

      secureLog.info('Novos termos aceitos com sucesso');
      return true;
    } catch (error) {
      secureLog.error('Erro ao aceitar termos:', error);
      return false;
    }
  };

  useEffect(() => {
    checkTermsStatus();
  }, [user?.id]);

  return {
    ...termsStatus,
    acceptNewTerms,
    refreshStatus: checkTermsStatus
  };
};