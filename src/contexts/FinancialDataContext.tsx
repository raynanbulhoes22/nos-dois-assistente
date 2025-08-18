import React, { createContext, useContext, useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  key: string;
}

interface FinancialDataContextType {
  getFromCache: <T>(key: string) => T | null;
  setCache: <T>(key: string, data: T, customTTL?: number) => void;
  invalidateCache: (key?: string) => void;
  isCacheValid: (key: string) => boolean;
  setGlobalLoading: (loading: boolean) => void;
  isGlobalLoading: boolean;
  forceRefresh: () => void;
  getCacheStats: () => { memoryEntries: number; storageEntries: number; };
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

class FinancialCacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private storageKey = 'financial_cache';
  
  constructor(private userId?: string) {}
  
  private generateKey(key: string): string {
    return this.userId ? `${this.userId}_${key}` : key;
  }
  
  private isValidEntry(entry: CacheEntry, customTTL?: number): boolean {
    const ttl = customTTL || CACHE_TTL;
    return Date.now() - entry.timestamp < ttl;
  }
  
  get<T>(key: string, customTTL?: number): T | null {
    const fullKey = this.generateKey(key);
    const entry = this.memoryCache.get(fullKey);
    if (entry && this.isValidEntry(entry, customTTL)) {
      return entry.data;
    }
    return null;
  }
  
  set<T>(key: string, data: T): void {
    const fullKey = this.generateKey(key);
    this.memoryCache.set(fullKey, {
      data,
      timestamp: Date.now(),
      key: fullKey
    });
  }
  
  invalidate(key?: string): void {
    if (key) {
      const fullKey = this.generateKey(key);
      this.memoryCache.delete(fullKey);
    } else {
      this.memoryCache.clear();
    }
  }
  
  isValid(key: string, customTTL?: number): boolean {
    const fullKey = this.generateKey(key);
    const entry = this.memoryCache.get(fullKey);
    return entry ? this.isValidEntry(entry, customTTL) : false;
  }
  
  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      storageEntries: 0
    };
  }
}

interface FinancialDataProviderProps {
  children: ReactNode;
  user?: User | null;
}

export const FinancialDataProvider: React.FC<FinancialDataProviderProps> = ({
  children,
  user
}) => {
  const [isGlobalLoading, setGlobalLoading] = useState(false);
  const cacheManager = useRef<FinancialCacheManager>();
  
  useEffect(() => {
    cacheManager.current = new FinancialCacheManager(user?.id);
    if (!user?.id) {
      cacheManager.current?.invalidate();
    }
  }, [user?.id]);
  
  const getFromCache = useCallback(<T,>(key: string): T | null => {
    return cacheManager.current?.get<T>(key) || null;
  }, []);
  
  const setCache = useCallback(<T,>(key: string, data: T, customTTL?: number): void => {
    cacheManager.current?.set(key, data);
  }, []);
  
  const invalidateCache = useCallback((key?: string): void => {
    cacheManager.current?.invalidate(key);
  }, []);
  
  const isCacheValid = useCallback((key: string): boolean => {
    return cacheManager.current?.isValid(key) || false;
  }, []);
  
  const forceRefresh = useCallback(() => {
    invalidateCache();
    cacheManager.current = new FinancialCacheManager(user?.id);
  }, [user?.id, invalidateCache]);
  
  const getCacheStats = useCallback(() => {
    return cacheManager.current?.getStats() || { memoryEntries: 0, storageEntries: 0 };
  }, []);
  
  const value: FinancialDataContextType = {
    getFromCache,
    setCache,
    invalidateCache,
    isCacheValid,
    setGlobalLoading,
    isGlobalLoading,
    forceRefresh,
    getCacheStats
  };
  
  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
};

export const useFinancialCache = (): FinancialDataContextType => {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialCache must be used within a FinancialDataProvider');
  }
  return context;
};