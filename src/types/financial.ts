// Centralized financial data types to avoid inconsistencies

export interface BaseMovimentacao {
  id: string;
  valor: number;
  data: string;
  categoria?: string;
  nome?: string;
  titulo?: string;
  forma_pagamento?: string;
  estabelecimento?: string;
  observacao?: string;
  tipo_movimento?: string;
  numero_wpp?: string;
  instituicao?: string;
  cartao_final?: string;
  ultimos_digitos?: string;
  apelido?: string;
  origem?: string;
  recorrente?: boolean;
  id_transacao?: string;
  isEntrada: boolean;
}

export interface FinancialPeriod {
  mes: number;
  ano: number;
}

export interface SaldoCalculation {
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
  saldoComputado: number;
}

export interface CartaoData {
  id: string;
  user_id: string;
  apelido: string;
  ultimos_digitos: string;
  limite: number;
  limite_disponivel?: number;
  dia_vencimento?: number;
  vencimento_fatura?: number;
  ativo: boolean;
}

export interface FinancialValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CacheStrategy {
  key: string;
  ttl: number; // milliseconds
  dependencies: string[];
}