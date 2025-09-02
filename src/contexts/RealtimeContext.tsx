import React, { createContext, useContext, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RealtimeContextType {
  invalidateCache: (tables: string[]) => void;
  registerInvalidationCallback: (table: string, callback: () => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const callbacksRef = useRef<Map<string, Set<() => void>>>(new Map());
  const channelsRef = useRef<Map<string, any>>(new Map());

  const invalidateCache = useCallback((tables: string[]) => {
    console.log('[Realtime] Invalidating cache for tables:', tables);
    tables.forEach(table => {
      const callbacks = callbacksRef.current.get(table);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error(`[Realtime] Error executing callback for table ${table}:`, error);
          }
        });
      }
    });
  }, []);

  const registerInvalidationCallback = useCallback((table: string, callback: () => void) => {
    if (!callbacksRef.current.has(table)) {
      callbacksRef.current.set(table, new Set());
    }
    callbacksRef.current.get(table)!.add(callback);

    // Setup realtime channel for this table if not exists and user is authenticated
    if (user && !channelsRef.current.has(table)) {
      console.log('[Realtime] Setting up channel for table:', table);
      
      const channel = supabase
        .channel(`table-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('[Realtime] Change detected for table:', table, payload);
            
            // Invalidate cache for the changed table and related tables
            const relatedTables = getRelatedTables(table);
            invalidateCache([table, ...relatedTables]);
          }
        )
        .subscribe();

      channelsRef.current.set(table, channel);
    }

    // Return cleanup function
    return () => {
      callbacksRef.current.get(table)?.delete(callback);
      if (callbacksRef.current.get(table)?.size === 0) {
        const channel = channelsRef.current.get(table);
        if (channel) {
          supabase.removeChannel(channel);
          channelsRef.current.delete(table);
        }
        callbacksRef.current.delete(table);
      }
    };
  }, [user, invalidateCache]);

  return (
    <RealtimeContext.Provider value={{ invalidateCache, registerInvalidationCallback }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

// Helper function to determine related tables that should be invalidated
function getRelatedTables(table: string): string[] {
  const relations = {
    'registros_financeiros': ['cartoes_credito', 'contas_parceladas', 'gastos_fixos', 'fontes_renda'],
    'cartoes_credito': ['registros_financeiros'],
    'contas_parceladas': ['registros_financeiros'],
    'gastos_fixos': ['registros_financeiros'],
    'fontes_renda': ['registros_financeiros']
  };
  
  return relations[table as keyof typeof relations] || [];
}