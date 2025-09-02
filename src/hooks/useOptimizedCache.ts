import { useCallback } from 'react';
import { useFinancialCache } from '@/contexts/FinancialDataContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from './useAuth';

export const useOptimizedCache = () => {
  const { user } = useAuth();
  const { invalidateCache } = useFinancialCache();
  const { invalidateCache: invalidateRealtime } = useRealtime();

  const invalidateRelatedCaches = useCallback((operation: string, table: string) => {
    if (!user) return;

    console.log(`[OptimizedCache] ${operation} operation on ${table} - invalidating related caches`);

    // Always invalidate the main table cache
    invalidateCache(`${table.replace('_', 's')}_${user.id}`);

    // Define cache invalidation strategies based on the table
    const cacheInvalidationMap = {
      'registros_financeiros': [
        `movimentacoes_${user.id}`,
        `faturas_futuras_${user.id}`,
        `financial_stats_${user.id}`,
        `dashboard_data_${user.id}`,
        `saldo_inicial_${user.id}`,
        'financial_overview',
        'monthly_stats'
      ],
      'cartoes_credito': [
        `cartoes_${user.id}`,
        `movimentacoes_${user.id}`,
        `faturas_futuras_${user.id}`,
        `financial_stats_${user.id}`,
        'credit_limits'
      ],
      'contas_parceladas': [
        `contas_parceladas_${user.id}`,
        `financial_stats_${user.id}`,
        `dashboard_data_${user.id}`,
        'installments_projection',
        'monthly_projections'
      ],
      'gastos_fixos': [
        `gastos_fixos_${user.id}`,
        `financial_stats_${user.id}`,
        `dashboard_data_${user.id}`,
        `orcamentos_${user.id}`,
        'fixed_expenses_projection'
      ],
      'fontes_renda': [
        `fontes_renda_${user.id}`,
        `financial_stats_${user.id}`,
        `dashboard_data_${user.id}`,
        `orcamentos_${user.id}`,
        'income_projection'
      ],
      'orcamentos_mensais': [
        `orcamentos_${user.id}`,
        `orcamentos_categorias_${user.id}`,
        `dashboard_data_${user.id}`,
        'budget_analysis'
      ]
    };

    // Invalidate related caches
    const cacheKeys = cacheInvalidationMap[table as keyof typeof cacheInvalidationMap] || [];
    cacheKeys.forEach(key => invalidateCache(key));

    // Trigger realtime invalidation for cross-table dependencies
    const realtimeTables = getRelatedTables(table);
    if (realtimeTables.length > 0) {
      invalidateRealtime([table, ...realtimeTables]);
    }

    console.log(`[OptimizedCache] Invalidated ${cacheKeys.length} cache keys and ${realtimeTables.length} realtime tables`);
  }, [user, invalidateCache, invalidateRealtime]);

  const onSuccessfulOperation = useCallback((operation: 'create' | 'update' | 'delete', table: string, showToast = true) => {
    invalidateRelatedCaches(operation, table);
    
    if (showToast) {
      const operationMessages = {
        create: 'Item criado com sucesso!',
        update: 'Item atualizado com sucesso!',
        delete: 'Item excluído com sucesso!'
      };
      
      // Note: Toast would be handled by the calling component
      console.log(`[OptimizedCache] ${operationMessages[operation]}`);
    }
  }, [invalidateRelatedCaches]);

  return {
    invalidateRelatedCaches,
    onSuccessfulOperation
  };
};

// Helper function to get related tables for cross-invalidation
function getRelatedTables(table: string): string[] {
  const relations = {
    'registros_financeiros': ['cartoes_credito', 'contas_parceladas'],
    'cartoes_credito': ['registros_financeiros'],
    'contas_parceladas': ['registros_financeiros'],
    'gastos_fixos': ['orcamentos_mensais'],
    'fontes_renda': ['orcamentos_mensais'],
    'orcamentos_mensais': ['gastos_fixos', 'fontes_renda']
  };
  
  return relations[table as keyof typeof relations] || [];
}