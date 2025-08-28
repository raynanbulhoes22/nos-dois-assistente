// Security headers and CSP configuration
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob: https://www.facebook.com https://www.google-analytics.com",
      "connect-src 'self' https://hgdwjxmorrpqdmxslwmz.supabase.co https://api.stripe.com https://checkout.stripe.com wss://hgdwjxmorrpqdmxslwmz.supabase.co https://www.facebook.com https://www.google-analytics.com https://analytics.google.com",
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
  // Only apply CSP via meta tag (X-Frame-Options not supported in meta tags)
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  
  // More flexible CSP for development
  const csp = import.meta.env.DEV 
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        "img-src 'self' data: blob: https://www.facebook.com https://www.google-analytics.com",
        "connect-src 'self' ws: wss: https://www.facebook.com https://www.google-analytics.com https://analytics.google.com",
        "frame-src 'self'",
        "object-src 'none'"
      ].join('; ')
    : getSecurityHeaders()['Content-Security-Policy'];
    
  cspMeta.content = csp;
  document.head.appendChild(cspMeta);
};

// Session security utilities
export const enhanceSessionSecurity = (): void => {
  let sessionTimeout: NodeJS.Timeout;
  let activityListeners: Array<() => void> = [];
  
  const resetSessionTimeout = () => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
      try {
        // Clear session and redirect after inactivity
        sessionStorage.clear();
        window.location.href = '/';
      } catch (error) {
        console.error('Error during session timeout:', error);
      }
    }, 30 * 60 * 1000);
  };
  
  // Add activity listeners with cleanup tracking
  const addActivityListener = (event: string) => {
    const handler = () => resetSessionTimeout();
    document.addEventListener(event, handler, { passive: true });
    activityListeners.push(() => document.removeEventListener(event, handler));
  };
  
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(addActivityListener);
  
  resetSessionTimeout();
  
  // Cleanup on page unload
  const cleanup = () => {
    clearTimeout(sessionTimeout);
    activityListeners.forEach(cleanup => cleanup());
    activityListeners = [];
  };
  
  window.addEventListener('beforeunload', cleanup);
  
  // Store cleanup function globally for potential manual cleanup
  (window as any).__sessionSecurityCleanup = cleanup;
};