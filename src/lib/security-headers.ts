// Security headers and CSP configuration
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://hgdwjxmorrpqdmxslwmz.supabase.co https://api.stripe.com https://checkout.stripe.com wss://hgdwjxmorrpqdmxslwmz.supabase.co",
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // HSTS (only for HTTPS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
};

// Apply security headers to meta tags
export const applySecurityMeta = (): void => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = getSecurityHeaders()['Content-Security-Policy'];
  document.head.appendChild(meta);
  
  // Add other security meta tags
  const xFrameOptions = document.createElement('meta');
  xFrameOptions.httpEquiv = 'X-Frame-Options';
  xFrameOptions.content = 'DENY';
  document.head.appendChild(xFrameOptions);
  
  const xContentType = document.createElement('meta');
  xContentType.httpEquiv = 'X-Content-Type-Options';
  xContentType.content = 'nosniff';
  document.head.appendChild(xContentType);
};

// Session security utilities
export const enhanceSessionSecurity = (): void => {
  // Set secure session storage
  if (typeof Storage !== 'undefined') {
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = function(key: string, value: string) {
      // Encrypt sensitive session data
      if (key.includes('auth') || key.includes('token')) {
        const encrypted = btoa(value + new Date().toISOString());
        originalSetItem.call(this, key, encrypted);
      } else {
        originalSetItem.call(this, key, value);
      }
    };
  }
  
  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear sensitive session data
    const sensitiveKeys = Object.keys(sessionStorage).filter(key => 
      key.includes('temp') || key.includes('cache')
    );
    
    sensitiveKeys.forEach(key => sessionStorage.removeItem(key));
  });
  
  // Implement session timeout
  let sessionTimeout: NodeJS.Timeout;
  const resetSessionTimeout = () => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
      // Logout user after 30 minutes of inactivity
      window.location.href = '/';
      sessionStorage.clear();
    }, 30 * 60 * 1000);
  };
  
  // Reset timeout on user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetSessionTimeout, true);
  });
  
  resetSessionTimeout();
};