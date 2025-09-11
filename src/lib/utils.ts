import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: any): string {
  // Enhanced validation and fallback
  const safeValue = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0;
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(safeValue);
  } catch (error) {
    console.warn('Error formatting currency:', error);
    return `R$ ${safeValue.toFixed(2).replace('.', ',')}`;
  }
}

// Legacy alias - will be deprecated in favor of formatCurrencySafe from financial-utils
export const formatCurrencySafe = formatCurrency;
