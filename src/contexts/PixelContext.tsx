import React, { createContext, useContext, ReactNode } from 'react';
import { usePixelManager } from '@/hooks/usePixelManager';

// Pixel configuration - in production, these should come from environment variables
const PIXEL_CONFIG = {
  facebookPixelId: process.env.NODE_ENV === 'production' ? 'YOUR_FB_PIXEL_ID' : undefined,
  googleAnalyticsId: process.env.NODE_ENV === 'production' ? 'YOUR_GA_ID' : undefined,
  googleAdsId: process.env.NODE_ENV === 'production' ? 'YOUR_GOOGLE_ADS_ID' : undefined,
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