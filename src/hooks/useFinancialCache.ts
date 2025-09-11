import { useState, useCallback, useRef } from 'react';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in ms
}

export const useFinancialCache = () => {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());
  const [cacheVersion, setCacheVersion] = useState(0);

  const isExpired = useCallback((entry: CacheEntry<any>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const getFromCache = useCallback(<T>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;
    
    if (isExpired(entry)) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return entry.data as T;
  }, [isExpired]);

  const setCache = useCallback(<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    cacheRef.current.set(key, entry);
    setCacheVersion(prev => prev + 1);
  }, []);

  const invalidateCache = useCallback((keyPattern?: string): void => {
    if (!keyPattern) {
      cacheRef.current.clear();
    } else {
      const keysToDelete: string[] = [];
      for (const key of cacheRef.current.keys()) {
        if (key.includes(keyPattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => cacheRef.current.delete(key));
    }
    setCacheVersion(prev => prev + 1);
  }, []);

  const getCacheStats = useCallback(() => {
    const totalEntries = cacheRef.current.size;
    let expiredEntries = 0;
    
    for (const entry of cacheRef.current.values()) {
      if (isExpired(entry)) {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries,
      expiredEntries,
      validEntries: totalEntries - expiredEntries,
      cacheVersion
    };
  }, [isExpired, cacheVersion]);

  // Cleanup expired entries periodically
  const cleanupExpiredEntries = useCallback(() => {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of cacheRef.current.entries()) {
      if (isExpired(entry)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => cacheRef.current.delete(key));
    
    if (keysToDelete.length > 0) {
      setCacheVersion(prev => prev + 1);
    }
    
    return keysToDelete.length;
  }, [isExpired]);

  return {
    getFromCache,
    setCache,
    invalidateCache,
    getCacheStats,
    cleanupExpiredEntries
  };
};