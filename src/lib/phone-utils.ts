/**
 * Utilitários para normalização e validação de números de telefone
 */

/**
 * Normaliza um número de telefone para o formato padrão brasileiro: 556992290572
 * Remove caracteres especiais e garante que tenha o código do país (55)
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  console.log('Normalizando telefone:', phone, '-> cleaned:', cleaned);
  
  // Se começa com +55, remove o +
  if (phone.startsWith('+55')) {
    cleaned = cleaned.substring(0); // já foi limpo acima
  }
  
  // Se não tem código do país, adiciona 55
  if (!cleaned.startsWith('55')) {
    // Se tem 11 dígitos (telefone brasileiro completo sem código do país)
    if (cleaned.length === 11) {
      cleaned = '55' + cleaned;
    }
    // Se tem 10 dígitos (telefone fixo sem código do país)
    else if (cleaned.length === 10) {
      cleaned = '55' + cleaned;
    }
    // Se tem 9 dígitos (celular sem DDD e código do país)
    else if (cleaned.length === 9) {
      // Assumir DDD padrão se necessário - aqui vou usar um DDD genérico
      // Na prática, isso deveria ser configurável ou inferido do contexto
      cleaned = '5511' + cleaned;
    }
  }
  
  // Garantir que tem exatamente 13 dígitos para celular (55 + 2 DDD + 9 número)
  // ou 12 dígitos para fixo (55 + 2 DDD + 8 número)
  if (cleaned.length >= 12 && cleaned.length <= 13) {
    console.log('Telefone normalizado:', cleaned);
    return cleaned;
  }
  
  console.warn('Telefone com tamanho inesperado:', cleaned, 'length:', cleaned.length);
  return cleaned;
};

/**
 * Valida se um número de telefone está no formato correto
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  
  // Deve ter entre 12 e 13 dígitos
  // 12: 55 + 2 DDD + 8 (fixo)
  // 13: 55 + 2 DDD + 9 (celular)
  const isValid = normalized.length >= 12 && normalized.length <= 13 && normalized.startsWith('55');
  
  console.log('Validando telefone:', phone, '-> normalized:', normalized, '-> valid:', isValid);
  return isValid;
};

/**
 * Formata um número normalizado para exibição
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (normalized.length === 13) {
    // Celular: 55 (11) 99999-9999
    const match = normalized.match(/^55(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  } else if (normalized.length === 12) {
    // Fixo: 55 (11) 9999-9999
    const match = normalized.match(/^55(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  
  return phone;
};

/**
 * Converte formato de exibição de volta para formato normalizado
 */
export const parseDisplayToNormalized = (displayPhone: string): string => {
  return normalizePhoneNumber(displayPhone);
};