import { useEffect, useCallback } from 'react';
import { useCookieConsent } from './useCookieConsent';

declare global {
  interface Window {
    fbq?: (action: string, event: string, parameters?: any) => void;
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

type PixelConfig = {
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  googleAdsId?: string;
};

type ConversionEvent = {
  event: string;
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  custom_parameters?: Record<string, any>;
};

export const usePixelManager = (config: PixelConfig) => {
  const { preferences } = useCookieConsent();

  // Load Facebook Pixel
  const loadFacebookPixel = useCallback(() => {
    if (!config.facebookPixelId || !preferences?.marketing) return;

    if (window.fbq) return; // Already loaded

    // Facebook Pixel Code
    const fbq: any = function(...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args);
      } else {
        fbq.queue = fbq.queue || [];
        fbq.queue.push(args);
      }
    };
    
    window.fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    fbq.callMethod = null;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    fbq('init', config.facebookPixelId);
    fbq('track', 'PageView');
  }, [config.facebookPixelId, preferences?.marketing]);

  // Load Google Analytics
  const loadGoogleAnalytics = useCallback(() => {
    if (!config.googleAnalyticsId || !preferences?.analytics) return;

    if (window.gtag) return; // Already loaded

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer!.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', config.googleAnalyticsId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: preferences?.marketing || false,
    });
  }, [config.googleAnalyticsId, preferences?.analytics, preferences?.marketing]);

  // Track conversion events
  const trackConversion = useCallback((eventData: ConversionEvent) => {
    if (!preferences) return;

    // Facebook Pixel
    if (window.fbq && preferences.marketing && config.facebookPixelId) {
      const fbParams: any = {
        value: eventData.value,
        currency: eventData.currency || 'BRL',
      };
      
      if (eventData.content_ids) {
        fbParams.content_ids = eventData.content_ids;
        fbParams.content_type = eventData.content_type || 'product';
      }

      window.fbq('track', eventData.event, fbParams);
    }

    // Google Analytics
    if (window.gtag && preferences.analytics && config.googleAnalyticsId) {
      const gtParams: any = {
        event_category: 'engagement',
        value: eventData.value,
        currency: eventData.currency || 'BRL',
        ...eventData.custom_parameters,
      };

      window.gtag('event', eventData.event, gtParams);
    }
  }, [preferences, config]);

  // Track page views
  const trackPageView = useCallback((page?: string) => {
    if (!preferences) return;

    if (window.fbq && preferences.marketing) {
      window.fbq('track', 'PageView');
    }

    if (window.gtag && preferences.analytics && config.googleAnalyticsId) {
      window.gtag('config', config.googleAnalyticsId, {
        page_path: page || window.location.pathname,
      });
    }
  }, [preferences, config.googleAnalyticsId]);

  // Predefined conversion events
  const trackSignUp = useCallback((userId?: string) => {
    trackConversion({
      event: 'CompleteRegistration',
      custom_parameters: { user_id: userId },
    });
  }, [trackConversion]);

  const trackSubscription = useCallback((value: number, tier: string) => {
    trackConversion({
      event: 'Subscribe',
      value,
      currency: 'BRL',
      custom_parameters: { subscription_tier: tier },
    });
  }, [trackConversion]);

  const trackAddPaymentInfo = useCallback(() => {
    trackConversion({
      event: 'AddPaymentInfo',
    });
  }, [trackConversion]);

  const trackViewContent = useCallback((contentType: string, contentId?: string) => {
    trackConversion({
      event: 'ViewContent',
      content_type: contentType,
      content_ids: contentId ? [contentId] : undefined,
    });
  }, [trackConversion]);

  // Load pixels when consent changes
  useEffect(() => {
    if (!preferences) return;

    loadFacebookPixel();
    loadGoogleAnalytics();
  }, [preferences, loadFacebookPixel, loadGoogleAnalytics]);

  // Handle consent revocation
  useEffect(() => {
    const handleConsentRevoked = () => {
      // Remove tracking scripts
      const scripts = document.querySelectorAll('script[src*="facebook.net"], script[src*="googletagmanager.com"]');
      scripts.forEach(script => script.remove());
      
      // Clear global variables
      delete window.fbq;
      delete window.gtag;
      delete window.dataLayer;
    };

    window.addEventListener('cookieConsentRevoked', handleConsentRevoked);
    return () => window.removeEventListener('cookieConsentRevoked', handleConsentRevoked);
  }, []);

  return {
    trackConversion,
    trackPageView,
    trackSignUp,
    trackSubscription,
    trackAddPaymentInfo,
    trackViewContent,
    isMarketingEnabled: preferences?.marketing || false,
    isAnalyticsEnabled: preferences?.analytics || false,
  };
};