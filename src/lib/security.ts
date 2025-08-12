import DOMPurify from 'dompurify';

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