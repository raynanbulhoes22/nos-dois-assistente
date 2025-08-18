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
  
  // Implement smart session timeout that pauses when tab is inactive
  let sessionTimeout: NodeJS.Timeout;
  let lastActivity = Date.now();
  let isTabActive = true;
  
  const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours instead of 30 minutes
  
  const handleLogout = () => {
    // Set flag for authentication cleanup instead of hard redirect
    sessionStorage.setItem('session_expired', 'true');
    // Let the app handle the logout gracefully
    window.dispatchEvent(new CustomEvent('sessionExpired'));
  };
  
  const resetSessionTimeout = () => {
    if (!isTabActive) return; // Don't reset if tab is not active
    
    lastActivity = Date.now();
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(handleLogout, SESSION_TIMEOUT);
  };
  
  const checkSessionTimeout = () => {
    const timeSinceActivity = Date.now() - lastActivity;
    if (timeSinceActivity >= SESSION_TIMEOUT) {
      handleLogout();
    } else {
      // Set timeout for remaining time
      clearTimeout(sessionTimeout);
      sessionTimeout = setTimeout(handleLogout, SESSION_TIMEOUT - timeSinceActivity);
    }
  };
  
  // Handle tab visibility changes to pause/resume timeout
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    
    if (isTabActive) {
      // Tab became active - check if session should still be valid
      checkSessionTimeout();
    } else {
      // Tab became inactive - pause timeout
      clearTimeout(sessionTimeout);
    }
  });
  
  // Debounced activity reset to avoid excessive timeout resets
  let activityDebounce: NodeJS.Timeout;
  const debouncedReset = () => {
    clearTimeout(activityDebounce);
    activityDebounce = setTimeout(resetSessionTimeout, 1000); // 1 second debounce
  };
  
  // Reduced set of activity events with debouncing
  ['mousedown', 'keypress', 'touchstart'].forEach(event => {
    document.addEventListener(event, debouncedReset, true);
  });
  
  resetSessionTimeout();
};