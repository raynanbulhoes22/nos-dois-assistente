/**
 * Utilitários para normalização e validação de números de telefone
 */

/**
 * Normaliza um número de telefone brasileiro no formato: 55 + DDD + 8 dígitos
 * @param ddd - DDD do estado (ex: "11", "21", "85")
 * @param number - Número de 8 dígitos (ex: "99887766")
 * @returns Número normalizado no formato 556992936131
 */
export const normalizeBrazilianPhone = (ddd: string, number: string): string => {
  const cleanDDD = ddd.replace(/\D/g, '');
  const cleanNumber = number.replace(/\D/g, '');
  
  // Validar DDD (deve ter 2 dígitos)
  if (cleanDDD.length !== 2) {
    console.warn('DDD inválido:', ddd);
    return '';
  }
  
  // Validar número (deve ter exatamente 8 dígitos)
  if (cleanNumber.length !== 8) {
    console.warn('Número deve ter exatamente 8 dígitos:', number);
    return '';
  }
  
  const normalized = '55' + cleanDDD + cleanNumber;
  console.log('Telefone normalizado (Brasil):', normalized);
  return normalized;
};

/**
 * Extrai DDD de um número normalizado
 * @param phone - Número normalizado (ex: "556992936131")
 * @returns DDD (ex: "69") ou null se não conseguir extrair
 */
export const extractDDDFromPhone = (phone: string): string | null => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 12 && cleaned.startsWith('55')) {
    return cleaned.substring(2, 4);
  }
  
  if (cleaned.length === 10) {
    return cleaned.substring(0, 2);
  }
  
  return null;
};

/**
 * Extrai o número (8 dígitos) de um telefone normalizado
 * @param phone - Número normalizado (ex: "556992936131")
 * @returns Número de 8 dígitos (ex: "92936131") ou null
 */
export const extractNumberFromPhone = (phone: string): string | null => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 12 && cleaned.startsWith('55')) {
    return cleaned.substring(4);
  }
  
  if (cleaned.length === 10) {
    return cleaned.substring(2);
  }
  
  return null;
};

/**
 * COMPATIBILIDADE: Normaliza um número de telefone para o formato padrão brasileiro
 * Esta função mantém compatibilidade com números já existentes no banco
 * @deprecated Use normalizeBrazilianPhone com DDD e número separados para novos números
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  console.log('Normalizando telefone (compatibilidade):', phone, '-> cleaned:', cleaned);
  
  // Remove códigos do país duplicados (5555...)
  while (cleaned.startsWith('5555')) {
    cleaned = cleaned.substring(2);
  }
  
  // Se não tem código do país, adiciona 55
  if (!cleaned.startsWith('55')) {
    // Se tem 11 dígitos (DDD + 9 dígitos - remove o 9º dígito)
    if (cleaned.length === 11) {
      const ddd = cleaned.substring(0, 2);
      const numero = cleaned.substring(3); // Pula o 9º dígito
      cleaned = '55' + ddd + numero;
      console.log('Removido 9º dígito automaticamente:', cleaned);
    }
    // Se tem 10 dígitos (DDD + 8 dígitos - formato correto)
    else if (cleaned.length === 10) {
      cleaned = '55' + cleaned;
    }
    // Se tem 9 dígitos (DDD de 1 dígito + 8 dígitos)
    else if (cleaned.length === 9) {
      const ddd = cleaned.substring(0, 1);
      const numero = cleaned.substring(1); // Pega o restante (8 dígitos)
      cleaned = '551' + ddd + numero; // DDD 11-19 (região SP/RJ)
      console.log('DDD de 1 dígito normalizado (assumindo região SP/RJ):', cleaned);
    }
    // Se tem 8 dígitos (só o número sem DDD)
    else if (cleaned.length === 8) {
      cleaned = '5511' + cleaned; // Assume DDD 11 (São Paulo)
    }
  } else {
    // Já tem código do país (55)
    // Se tem 13 dígitos (55 + DDD + 9 dígitos - remove o 9º dígito)
    if (cleaned.length === 13) {
      const codigoPais = cleaned.substring(0, 2); // 55
      const ddd = cleaned.substring(2, 4);
      const numero = cleaned.substring(5); // Pula o 9º dígito
      cleaned = codigoPais + ddd + numero;
      console.log('Removido 9º dígito automaticamente (com código país):', cleaned);
    }
    // Se tem 14 dígitos (duplicação do código do país)
    else if (cleaned.length === 14) {
      cleaned = cleaned.substring(2); // Remove o primeiro 55
      // Agora trata como se fosse 12 dígitos normais
      if (cleaned.length === 12) {
        return cleaned;
      }
    }
  }
  
  // Garantir que tem exatamente 12 dígitos (55 + 2 DDD + 8 número)
  if (cleaned.length === 12) {
    console.log('Telefone normalizado (compatibilidade):', cleaned);
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
  
  // Deve ter exatamente 12 dígitos: 55 + 2 DDD + 8 número
  const isValid = normalized.length === 12 && normalized.startsWith('55');
  
  console.log('Validando telefone:', phone, '-> normalized:', normalized, '-> valid:', isValid);
  return isValid;
};

/**
 * Formata um número normalizado para exibição
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (normalized.length === 12) {
    // Formato: 55 (11) 9999-9999 (DDD + 8 dígitos)
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