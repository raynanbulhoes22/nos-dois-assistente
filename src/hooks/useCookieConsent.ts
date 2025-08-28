import { useState, useEffect } from 'react';

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

const STORAGE_KEY = 'cookie-preferences';
const CONSENT_VERSION = '1.0';

export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          setPreferences(parsed.preferences);
          setShowBanner(false);
        } else {
          setShowBanner(true);
        }
      } else {
        setShowBanner(true);
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
      setShowBanner(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreferences = (newPreferences: CookiePreferences) => {
    const consentData = {
      preferences: newPreferences,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    setPreferences(newPreferences);
    setShowBanner(false);

    // Trigger custom event for pixel manager
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
      detail: newPreferences 
    }));
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const revokeConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences(null);
    setShowBanner(true);
    
    // Clear existing cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    window.dispatchEvent(new CustomEvent('cookieConsentRevoked'));
  };

  return {
    preferences,
    showBanner,
    loading,
    savePreferences,
    acceptAll,
    acceptNecessary,
    revokeConsent,
  };
};