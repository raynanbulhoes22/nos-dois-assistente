import { useState, useMemo } from 'react';
import { Movimentacao } from './useMovimentacoes';
import { FINANCIAL_CATEGORIES, PAYMENT_METHODS } from '@/constants/categories';

export interface MovimentacoesFilters {
  search: string;
  period: {
    start: string;
    end: string;
    preset: string;
  };
  categories: string[];
  paymentMethods: string[];
  valueRange: {
    min: number | null;
    max: number | null;
  };
  transactionType: 'all' | 'entradas' | 'saidas';
  sortBy: 'data' | 'valor' | 'nome' | 'categoria';
  sortOrder: 'asc' | 'desc';
}

export const useMovimentacoesFilters = (movimentacoes: Movimentacao[]) => {
  const [filters, setFilters] = useState<MovimentacoesFilters>({
    search: '',
    period: {
      start: '',
      end: '',
      preset: 'all'
    },
    categories: [],
    paymentMethods: [],
    valueRange: {
      min: null,
      max: null
    },
    transactionType: 'all',
    sortBy: 'data',
    sortOrder: 'desc'
  });

  // Get available categories from data
  const availableCategories = useMemo(() => {
    const categoriesFromData = [...new Set(movimentacoes.map(m => m.categoria).filter(Boolean))];
    const allCategories = Object.values(FINANCIAL_CATEGORIES).flat();
    return [...new Set([...categoriesFromData, ...allCategories])].sort();
  }, [movimentacoes]);

  // Get available payment methods from data
  const availablePaymentMethods = useMemo(() => {
    const methodsFromData = [...new Set(movimentacoes.map(m => m.forma_pagamento).filter(Boolean))];
    return [...new Set([...methodsFromData, ...PAYMENT_METHODS])].sort();
  }, [movimentacoes]);

  // Get value range from data
  const valueRange = useMemo(() => {
    if (movimentacoes.length === 0) return { min: 0, max: 1000 };
    const values = movimentacoes.map(m => m.valor);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [movimentacoes]);

  // Filter and sort movimentacoes
  const filteredMovimentacoes = useMemo(() => {
    let filtered = [...movimentacoes];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.nome?.toLowerCase().includes(searchLower) ||
        m.categoria?.toLowerCase().includes(searchLower) ||
        m.estabelecimento?.toLowerCase().includes(searchLower) ||
        m.observacao?.toLowerCase().includes(searchLower)
      );
    }

    // Period filter
    if (filters.period.start) {
      filtered = filtered.filter(m => m.data >= filters.period.start);
    }
    if (filters.period.end) {
      filtered = filtered.filter(m => m.data <= filters.period.end);
    }

    // Categories filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(m => 
        m.categoria && filters.categories.includes(m.categoria)
      );
    }

    // Payment methods filter
    if (filters.paymentMethods.length > 0) {
      filtered = filtered.filter(m => 
        m.forma_pagamento && filters.paymentMethods.includes(m.forma_pagamento)
      );
    }

    // Value range filter
    if (filters.valueRange.min !== null) {
      filtered = filtered.filter(m => m.valor >= filters.valueRange.min!);
    }
    if (filters.valueRange.max !== null) {
      filtered = filtered.filter(m => m.valor <= filters.valueRange.max!);
    }

    // Transaction type filter
    if (filters.transactionType === 'entradas') {
      filtered = filtered.filter(m => m.isEntrada);
    } else if (filters.transactionType === 'saidas') {
      filtered = filtered.filter(m => !m.isEntrada);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'data':
          aValue = new Date(a.data).getTime();
          bValue = new Date(b.data).getTime();
          break;
        case 'valor':
          aValue = a.valor;
          bValue = b.valor;
          break;
        case 'nome':
          aValue = a.nome?.toLowerCase() || '';
          bValue = b.nome?.toLowerCase() || '';
          break;
        case 'categoria':
          aValue = a.categoria?.toLowerCase() || '';
          bValue = b.categoria?.toLowerCase() || '';
          break;
        default:
          aValue = new Date(a.data).getTime();
          bValue = new Date(b.data).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [movimentacoes, filters]);

  // Get filtered entradas and saidas
  const filteredEntradas = useMemo(() => 
    filteredMovimentacoes.filter(m => m.isEntrada), [filteredMovimentacoes]
  );

  const filteredSaidas = useMemo(() => 
    filteredMovimentacoes.filter(m => !m.isEntrada), [filteredMovimentacoes]
  );

  // Helper functions to update filters
  const updateFilter = <K extends keyof MovimentacoesFilters>(
    key: K, 
    value: MovimentacoesFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const setPeriodPreset = (preset: string) => {
    const today = new Date();
    let start = '';
    let end = '';

    switch (preset) {
      case 'today':
        start = end = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        start = weekStart.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        start = monthStart.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        start = yearStart.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      case 'all':
      default:
        start = end = '';
        break;
    }

    setFilters(prev => ({
      ...prev,
      period: { start, end, preset }
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      period: {
        start: '',
        end: '',
        preset: 'all'
      },
      categories: [],
      paymentMethods: [],
      valueRange: {
        min: null,
        max: null
      },
      transactionType: 'all',
      sortBy: 'data',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' ||
           filters.period.preset !== 'all' ||
           filters.categories.length > 0 ||
           filters.paymentMethods.length > 0 ||
           filters.valueRange.min !== null ||
           filters.valueRange.max !== null ||
           filters.transactionType !== 'all';
  }, [filters]);

  return {
    filters,
    filteredMovimentacoes,
    filteredEntradas,
    filteredSaidas,
    availableCategories,
    availablePaymentMethods,
    valueRange,
    updateFilter,
    setPeriodPreset,
    clearFilters,
    hasActiveFilters
  };
};