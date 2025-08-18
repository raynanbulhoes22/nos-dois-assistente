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

// Simplified session management - removed problematic timeout system
// Session management is now handled by Supabase natively through useAuth hook