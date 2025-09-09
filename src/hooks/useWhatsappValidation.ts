import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { normalizePhoneNumber } from '@/lib/phone-utils';
import { logger } from '@/lib/production-logger';

interface WhatsappValidationResult {
  isValid: boolean;
  isDuplicate: boolean;
  errorMessage?: string;
}

export const useWhatsappValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateWhatsapp = async (
    whatsapp: string, 
    currentUserId?: string
  ): Promise<WhatsappValidationResult> => {
    if (!whatsapp || whatsapp.trim() === '') {
      return {
        isValid: false,
        isDuplicate: false,
        errorMessage: 'WhatsApp é obrigatório'
      };
    }

    setIsValidating(true);
    
    try {
      // Normalizar o número para garantir formato consistente
      const normalizedWhatsapp = normalizePhoneNumber(whatsapp);
      
      if (!normalizedWhatsapp || normalizedWhatsapp.length !== 12) {
        return {
          isValid: false,
          isDuplicate: false,
          errorMessage: 'Formato de WhatsApp inválido'
        };
      }

      // Verificar se já existe outro usuário com este WhatsApp
      const { data: existingProfiles, error } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('numero_wpp', normalizedWhatsapp)
        .neq('id', currentUserId || ''); // Excluir o próprio usuário se fornecido

      if (error) {
        logger.error('Erro ao verificar WhatsApp duplicado', error);
        return {
          isValid: false,
          isDuplicate: false,
          errorMessage: 'Erro ao validar WhatsApp. Tente novamente.'
        };
      }

      if (existingProfiles && existingProfiles.length > 0) {
        return {
          isValid: false,
          isDuplicate: true,
          errorMessage: 'Este WhatsApp já está cadastrado por outro usuário'
        };
      }

      return {
        isValid: true,
        isDuplicate: false
      };

    } catch (error) {
      logger.error('Erro inesperado na validação de WhatsApp', error);
      return {
        isValid: false,
        isDuplicate: false,
        errorMessage: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setIsValidating(false);
    }
  };

  const validateConjugeWhatsapp = async (
    whatsapp: string,
    mainWhatsapp: string,
    currentUserId?: string
  ): Promise<WhatsappValidationResult> => {
    if (!whatsapp || whatsapp.trim() === '') {
      // WhatsApp do cônjuge pode ser opcional
      return { isValid: true, isDuplicate: false };
    }

    // Verificar se não é igual ao WhatsApp principal
    const normalizedMain = normalizePhoneNumber(mainWhatsapp);
    const normalizedConjuge = normalizePhoneNumber(whatsapp);
    
    if (normalizedMain === normalizedConjuge) {
      return {
        isValid: false,
        isDuplicate: false,
        errorMessage: 'WhatsApp do cônjuge deve ser diferente do seu'
      };
    }

    // Usar a mesma validação de duplicata
    return await validateWhatsapp(whatsapp, currentUserId);
  };

  return {
    validateWhatsapp,
    validateConjugeWhatsapp,
    isValidating
  };
};