import React, { createContext, useContext, ReactNode } from 'react';
import { usePixelManager } from '@/hooks/usePixelManager';

// Pixel configuration - loaded from environment variables
const PIXEL_CONFIG = {
  facebookPixelId: import.meta.env.VITE_FACEBOOK_PIXEL_ID,
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  googleAdsId: import.meta.env.VITE_GOOGLE_ADS_ID,
};

interface PixelContextType {
  trackConversion: (eventData: any) => void;
  trackPageView: (page?: string) => void;
  trackSignUp: (userId?: string) => void;
  trackSubscription: (value: number, tier: string) => void;
  trackAddPaymentInfo: () => void;
  trackViewContent: (contentType: string, contentId?: string) => void;
  isMarketingEnabled: boolean;
  isAnalyticsEnabled: boolean;
}

const PixelContext = createContext<PixelContextType | undefined>(undefined);

export const PixelProvider = ({ children }: { children: ReactNode }) => {
  const pixelManager = usePixelManager(PIXEL_CONFIG);

  return (
    <PixelContext.Provider value={pixelManager}>
      {children}
    </PixelContext.Provider>
  );
};

export const usePixel = () => {
  const context = useContext(PixelContext);
  if (context === undefined) {
    throw new Error('usePixel must be used within a PixelProvider');
  }
  return context;
};