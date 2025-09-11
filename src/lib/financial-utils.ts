import { BaseMovimentacao, FinancialPeriod, SaldoCalculation, FinancialValidationResult } from '@/types/financial';

/**
 * Safe number formatter that handles NaN, null, undefined
 */
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Enhanced currency formatter with validation
 */
export const formatCurrencySafe = (value: any): string => {
  const safeValue = safeNumber(value, 0);
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(safeValue);
  } catch (error) {
    console.warn('Error formatting currency:', error);
    return `R$ ${safeValue.toFixed(2).replace('.', ',')}`;
  }
};

/**
 * Safe percentage formatter
 */
export const formatPercentageSafe = (value: any, decimals: number = 1): string => {
  const safeValue = safeNumber(value, 0);
  return `${safeValue.toFixed(decimals)}%`;
};

/**
 * Validates if a period is valid
 */
export const isValidPeriod = (period: FinancialPeriod): boolean => {
  return period.mes >= 1 && period.mes <= 12 && period.ano >= 2020 && period.ano <= 2099;
};

/**
 * Gets the current financial period
 */
export const getCurrentPeriod = (): FinancialPeriod => {
  const now = new Date();
  return {
    mes: now.getMonth() + 1,
    ano: now.getFullYear()
  };
};

/**
 * Gets date range for a period
 */
export const getPeriodDateRange = (period: FinancialPeriod) => {
  const startDate = new Date(period.ano, period.mes - 1, 1);
  const endDate = new Date(period.ano, period.mes, 0); // Last day of month
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    startDateTime: startDate,
    endDateTime: endDate
  };
};

/**
 * Gets the last N months periods including current
 */
export const getLastNMonthsPeriods = (n: number = 12): FinancialPeriod[] => {
  const periods: FinancialPeriod[] = [];
  const current = getCurrentPeriod();
  
  for (let i = 0; i < n; i++) {
    let targetMes = current.mes - i;
    let targetAno = current.ano;
    
    if (targetMes <= 0) {
      targetMes += 12;
      targetAno -= 1;
    }
    
    periods.push({ mes: targetMes, ano: targetAno });
  }
  
  return periods.reverse(); // Oldest to newest
};

/**
 * Filters movimentacoes by period
 */
export const filterMovimentacoesByPeriod = (
  movimentacoes: BaseMovimentacao[],
  period: FinancialPeriod
): BaseMovimentacao[] => {
  const { startDateTime, endDateTime } = getPeriodDateRange(period);
  
  return movimentacoes.filter(mov => {
    const movDate = new Date(mov.data);
    return movDate >= startDateTime && movDate <= endDateTime;
  });
};

/**
 * Calculates basic financial totals for a period
 */
export const calculatePeriodTotals = (
  movimentacoes: BaseMovimentacao[],
  period: FinancialPeriod
): { entradas: number; saidas: number; saldo: number } => {
  const periodMovs = filterMovimentacoesByPeriod(movimentacoes, period);
  
  const entradas = periodMovs
    .filter(mov => mov.isEntrada && mov.categoria !== 'Saldo Inicial')
    .reduce((sum, mov) => sum + safeNumber(mov.valor), 0);
    
  const saidas = periodMovs
    .filter(mov => !mov.isEntrada && mov.categoria !== 'Saldo Inicial')
    .reduce((sum, mov) => sum + safeNumber(mov.valor), 0);
  
  return {
    entradas,
    saidas,
    saldo: entradas - saidas
  };
};

/**
 * Validates financial data for common issues
 */
export const validateFinancialData = (data: any): FinancialValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for NaN values
  if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'number' && isNaN(value)) {
        errors.push(`Campo ${key} contém valor inválido (NaN)`);
      }
      if (typeof value === 'number' && !isFinite(value)) {
        errors.push(`Campo ${key} contém valor infinito`);
      }
    });
  }
  
  // Check for negative values where they shouldn't be
  if (data.limite && safeNumber(data.limite) < 0) {
    warnings.push('Limite não pode ser negativo');
  }
  
  if (data.valor && safeNumber(data.valor) === 0) {
    warnings.push('Valor zero pode indicar erro de entrada de dados');
  }
  
  // Check date validity
  if (data.data && isNaN(Date.parse(data.data))) {
    errors.push('Data inválida');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Generates cache key for financial data
 */
export const generateCacheKey = (prefix: string, userId: string, ...params: any[]): string => {
  const paramsStr = params.map(p => 
    typeof p === 'object' ? JSON.stringify(p) : String(p)
  ).join('_');
  
  return `${prefix}_${userId}_${paramsStr}`;
};

/**
 * Categorizes a movimentacao as entrada or saida with improved logic
 */
export const categorizeMovimentacao = (item: any): boolean => {
  // Check tipo_movimento field first
  if (item.tipo_movimento) {
    return item.tipo_movimento.toLowerCase() === 'entrada';
  }

  const categoria = (item.categoria || '').toLowerCase();
  const nome = (item.nome || '').toLowerCase();
  const titulo = (item.titulo || '').toLowerCase();
  const estabelecimento = (item.estabelecimento || '').toLowerCase();
  
  const combinedText = `${categoria} ${nome} ${titulo} ${estabelecimento}`;
  
  const entradaKeywords = [
    'pagamento', 'recebimento', 'entrada', 'salário', 'renda', 
    'venda', 'depósito', 'pix recebido', 'transferência recebida',
    'cliente', 'receita', 'bônus', 'comissão', 'reembolso'
  ];

  const saidaKeywords = [
    'compra', 'gasto', 'saída', 'pagamento de', 'despesa',
    'aluguel', 'conta', 'supermercado', 'combustível', 'cartão',
    'financiamento', 'parcela', 'mensalidade'
  ];

  // Check for entrada keywords
  if (entradaKeywords.some(keyword => combinedText.includes(keyword))) {
    return true;
  }

  // Check for saida keywords
  if (saidaKeywords.some(keyword => combinedText.includes(keyword))) {
    return false;
  }

  // Default: positive values are entradas, negative are saidas
  return safeNumber(item.valor) > 0;
};

/**
 * Debug logger for financial calculations
 */
export const logFinancialCalculation = (operation: string, data: any, result?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🧮 Financial Calculation: ${operation}`);
    console.log('Input data:', data);
    if (result !== undefined) {
      console.log('Result:', result);
    }
    console.groupEnd();
  }
};