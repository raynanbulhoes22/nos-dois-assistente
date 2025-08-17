import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

// Secure logging utility to replace console.log in production
export const secureLog = {
  info: (message: string, data?: any): void => {
    if (import.meta.env.DEV) {
      console.info(message, data);
    }
    // In production, send to audit logs instead of console
    logSecurityEvent('INFO', message, data);
  },
  
  warn: (message: string, data?: any): void => {
    if (import.meta.env.DEV) {
      console.warn(message, data);
    }
    logSecurityEvent('WARN', message, data);
  },
  
  error: (message: string, data?: any): void => {
    if (import.meta.env.DEV) {
      console.error(message, data);
    }
    logSecurityEvent('ERROR', message, data);
  }
};

// Security event logging
const logSecurityEvent = async (level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any): Promise<void> => {
  try {
    // Only log in production and avoid logging sensitive data
    if (!import.meta.env.DEV) {
      const sanitizedData = data ? sanitizeLogData(data) : null;
      
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      // This would typically send to a secure logging service
      // For now, we'll store critical security events in audit logs
      if (level === 'ERROR' || message.includes('security') || message.includes('auth')) {
        await supabase.from('audit_logs').insert({
          user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          table_name: 'security_logs',
          operation: level,
          new_values: {
            message: sanitizeInput(message),
            data: sanitizedData,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href
          }
        });
      }
    }
  } catch (error) {
    // Fail silently to avoid logging loops
  }
};

// Sanitize log data to remove sensitive information
const sanitizeLogData = (data: any): any => {
  if (!data) return null;
  
  const sensitiveFields = ['password', 'token', 'cpf', 'email', 'phone', 'numero_wpp'];
  const sanitized = JSON.parse(JSON.stringify(data));
  
  const cleanObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    for (const key in obj) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        obj[key] = cleanObject(obj[key]);
      }
    }
    return obj;
  };
  
  return cleanObject(sanitized);
};

// CPF encryption utilities
export const encryptCPF = (cpf: string): string => {
  if (!cpf) return '';
  
  // Remove formatting
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Simple client-side encryption (in production, use proper encryption)
  const encoder = new TextEncoder();
  const data = encoder.encode(cleanCPF + 'CPF_SALT_2024');
  
  return btoa(String.fromCharCode(...data));
};

export const validateCPFFormat = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // Reject same digit repeated
  
  // CPF validation algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  return digit1 === parseInt(cleanCPF.charAt(9)) && digit2 === parseInt(cleanCPF.charAt(10));
};

// Rate limiting utility (simple client-side implementation)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canAttempt(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length < this.maxAttempts) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeUntilReset = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, timeUntilReset);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Password strength checker
export const checkPasswordStrength = (password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use pelo menos 8 caracteres');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Adicione letras minúsculas');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Adicione letras maiúsculas');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Adicione números');

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push('Adicione símbolos especiais');

  return {
    isStrong: score >= 4,
    score,
    feedback
  };
};

// CSS sanitization for chart components
export const sanitizeCSS = (css: string): string => {
  // Remove potentially dangerous CSS patterns
  const dangerousPatterns = [
    /javascript:/gi,
    /expression\s*\(/gi,
    /url\s*\(\s*['"]*(?!data:image\/)/gi, // Allow data URLs for images but block others
    /@import/gi,
    /behavior\s*:/gi,
    /-moz-binding/gi,
    /vbscript:/gi,
    /\\[\da-f]{1,6}/gi, // Remove CSS unicode escapes
    /<[^>]*>/g // Remove HTML tags
  ];
  
  let sanitized = css;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Validate CSS properties - only allow safe chart-related properties
  const lines = sanitized.split('\n');
  const safeCSSLines = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.includes('{') || trimmed.includes('}') || trimmed.startsWith('/*') || trimmed.endsWith('*/')) {
      return true;
    }
    
    // Allow CSS custom properties for chart colors
    if (trimmed.startsWith('--color-') && /^--color-[\w-]+\s*:\s*[#\w(),.\s%-]+;?$/.test(trimmed)) {
      return true;
    }
    
    // Allow specific CSS selectors for charts
    if (/^\s*[\w\-\[\]="'\s\.,:#]+\s*\{?\s*$/.test(trimmed)) {
      return true;
    }
    
    return false;
  });
  
  return safeCSSLines.join('\n');
};

// CSRF token generation (simple implementation)
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

// Secure session storage
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item securely:', error);
    }
  }
};