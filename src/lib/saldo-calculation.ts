// Centralized balance calculation logic
import { supabase } from "@/integrations/supabase/client";
import { safeNumber, getCurrentPeriod, logFinancialCalculation } from "@/lib/financial-utils";
import type { FinancialPeriod, SaldoCalculation } from "@/types/financial";

/**
 * Main balance calculation function - single source of truth
 */
export const calcularSaldoMes = async (
  userId: string, 
  period: FinancialPeriod
): Promise<SaldoCalculation> => {
  if (!userId) {
    throw new Error('User ID is required for balance calculation');
  }

  logFinancialCalculation('calcularSaldoMes - start', { userId, period });

  try {
    // 1. Get initial balance from monthly budget
    const { data: orcamento } = await supabase
      .from('orcamentos_mensais')
      .select('saldo_inicial')
      .eq('user_id', userId)
      .eq('mes', period.mes)
      .eq('ano', period.ano)
      .maybeSingle();

    const saldoInicial = safeNumber(orcamento?.saldo_inicial, 0);

    // 2. Get all financial records for the period (excluding Saldo Inicial)
    const startDate = new Date(period.ano, period.mes - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(period.ano, period.mes, 0).toISOString().split('T')[0];

    const { data: registros } = await supabase
      .from('registros_financeiros')
      .select('valor, tipo_movimento, categoria')
      .eq('user_id', userId)
      .gte('data', startDate)
      .lte('data', endDate)
      .neq('categoria', 'Saldo Inicial');

    if (!registros) {
      const result: SaldoCalculation = {
        saldoInicial,
        entradas: 0,
        saidas: 0,
        saldoFinal: saldoInicial,
        saldoComputado: saldoInicial
      };
      
      logFinancialCalculation('calcularSaldoMes - no records', { period }, result);
      return result;
    }

    // 3. Categorize and sum transactions
    let entradas = 0;
    let saidas = 0;

    registros.forEach(registro => {
      const valor = safeNumber(registro.valor, 0);
      const isEntrada = registro.tipo_movimento?.toLowerCase() === 'entrada' || valor > 0;
      
      if (isEntrada) {
        entradas += Math.abs(valor);
      } else {
        saidas += Math.abs(valor);
      }
    });

    // 4. Calculate final balance
    const saldoMovimentacoes = entradas - saidas;
    const saldoFinal = saldoInicial + saldoMovimentacoes;
    const saldoComputado = saldoFinal; // Same as saldoFinal for now

    const result: SaldoCalculation = {
      saldoInicial,
      entradas,
      saidas,
      saldoFinal,
      saldoComputado
    };

    logFinancialCalculation('calcularSaldoMes - result', { period, registrosCount: registros.length }, result);
    
    return result;

  } catch (error) {
    console.error('Error calculating balance:', error);
    
    // Return safe fallback
    return {
      saldoInicial: 0,
      entradas: 0,
      saidas: 0,
      saldoFinal: 0,
      saldoComputado: 0
    };
  }
};

/**
 * Calculate balance for current month
 */
export const calcularSaldoMesAtual = async (userId: string): Promise<SaldoCalculation> => {
  return calcularSaldoMes(userId, getCurrentPeriod());
};

/**
 * Calculate balance progression over multiple months
 */
export const calcularProgressaoSaldos = async (
  userId: string,
  periods: FinancialPeriod[]
): Promise<SaldoCalculation[]> => {
  const results: SaldoCalculation[] = [];
  
  for (const period of periods) {
    try {
      const saldo = await calcularSaldoMes(userId, period);
      results.push(saldo);
    } catch (error) {
      console.error(`Error calculating balance for ${period.mes}/${period.ano}:`, error);
      // Add safe fallback for this period
      results.push({
        saldoInicial: 0,
        entradas: 0,
        saidas: 0,
        saldoFinal: 0,
        saldoComputado: 0
      });
    }
  }
  
  return results;
};

/**
 * Validation function for balance calculations
 */
export const validarSaldoCalculation = (saldo: SaldoCalculation): boolean => {
  return (
    !isNaN(saldo.saldoInicial) &&
    !isNaN(saldo.entradas) &&
    !isNaN(saldo.saidas) &&
    !isNaN(saldo.saldoFinal) &&
    !isNaN(saldo.saldoComputado) &&
    isFinite(saldo.saldoInicial) &&
    isFinite(saldo.entradas) &&
    isFinite(saldo.saidas) &&
    isFinite(saldo.saldoFinal) &&
    isFinite(saldo.saldoComputado)
  );
};