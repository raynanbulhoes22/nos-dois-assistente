// Sistema unificado de status de pagamento para compromissos financeiros

export enum PaymentStatus {
  PENDING = 'pendente',
  PAID = 'pago',
  RECEIVED = 'recebido',
  OVERDUE = 'atrasado',
  CANCELLED = 'cancelado'
}

export enum PaymentType {
  EXPENSE = 'gasto',
  INCOME = 'renda',
  INSTALLMENT = 'parcela',
  INVOICE = 'fatura'
}

export interface PaymentStatusData {
  status: PaymentStatus;
  month: number;
  year: number;
  statusType?: 'manual' | 'automatic';
  detectedRecord?: any;
}

export interface CompromissoComStatus {
  id: string;
  nome: string;
  valor: number;
  tipo: PaymentType;
  status_atual: PaymentStatus;
  status_tipo: 'manual' | 'automatic';
  pago: boolean;
  recebido?: boolean;
  atrasado?: boolean;
  registroDetectado?: any;
  data_vencimento?: string;
  mes_referencia: number;
  ano_referencia: number;
  // Propriedades de compatibilidade para diferentes tipos
  valor_mensal?: number;  // Para gastos fixos
  valor_parcela?: number; // Para contas parceladas
  ativo?: boolean;       // Para todos os tipos
}

/**
 * Utilities para gerenciar status de pagamento de forma unificada
 */
export class PaymentStatusManager {
  
  /**
   * Verifica se um compromisso tem status para o mês/ano específico
   */
  static hasStatusForPeriod(
    compromisso: any,
    month: number,
    year: number
  ): boolean {
    return compromisso.status_manual_mes === month && 
           compromisso.status_manual_ano === year &&
           compromisso.status_manual !== null;
  }

  /**
   * Obtém o status atual do compromisso para o período
   */
  static getStatusForPeriod(
    compromisso: any,
    month: number,
    year: number,
    defaultStatus: PaymentStatus = PaymentStatus.PENDING
  ): PaymentStatus {
    if (this.hasStatusForPeriod(compromisso, month, year)) {
      return compromisso.status_manual as PaymentStatus;
    }
    return defaultStatus;
  }

  /**
   * Cria objeto de compromisso com status calculado
   */
  static createCompromissoComStatus(
    compromisso: any,
    month: number,
    year: number,
    paymentType: PaymentType,
    detectedRecord?: any
  ): CompromissoComStatus {
    const status = this.getStatusForPeriod(compromisso, month, year);
    const hasStatus = this.hasStatusForPeriod(compromisso, month, year);
    const valor = this.getCompromissoValue(compromisso, paymentType);
    
    return {
      id: compromisso.id,
      nome: compromisso.nome,
      valor,
      tipo: paymentType,
      status_atual: status,
      status_tipo: hasStatus ? 'manual' : (detectedRecord ? 'automatic' : 'manual'),
      pago: status === PaymentStatus.PAID,
      recebido: status === PaymentStatus.RECEIVED,
      atrasado: status === PaymentStatus.OVERDUE,
      registroDetectado: detectedRecord,
      data_vencimento: compromisso.data_vencimento,
      mes_referencia: month,
      ano_referencia: year,
      // Propriedades de compatibilidade
      valor_mensal: paymentType === PaymentType.EXPENSE ? valor : undefined,
      valor_parcela: paymentType === PaymentType.INSTALLMENT ? valor : undefined,
      ativo: compromisso.ativo
    };
  }

  /**
   * Obtém o valor do compromisso baseado no tipo
   */
  private static getCompromissoValue(compromisso: any, type: PaymentType): number {
    switch (type) {
      case PaymentType.EXPENSE:
        return compromisso.valor_mensal || compromisso.valor_principal || 0;
      case PaymentType.INCOME:
        return compromisso.valor || compromisso.valor_principal || 0;
      case PaymentType.INSTALLMENT:
        return compromisso.valor_parcela || compromisso.valor_principal || 0;
      case PaymentType.INVOICE:
        return compromisso.valor || compromisso.valor_principal || 0;
      default:
        return 0;
    }
  }

  /**
   * Atualiza status de pagamento
   */
  static createStatusUpdate(
    status: PaymentStatus,
    month: number,
    year: number
  ): {
    status_manual: PaymentStatus;
    status_manual_mes: number;
    status_manual_ano: number;
  } {
    return {
      status_manual: status,
      status_manual_mes: month,
      status_manual_ano: year
    };
  }

  /**
   * Remove status de pagamento (volta ao padrão)
   */
  static createStatusClearUpdate(): {
    status_manual: null;
    status_manual_mes: null;
    status_manual_ano: null;
  } {
    return {
      status_manual: null,
      status_manual_mes: null,
      status_manual_ano: null
    };
  }

  /**
   * Valida se um status é válido
   */
  static isValidStatus(status: string): status is PaymentStatus {
    return Object.values(PaymentStatus).includes(status as PaymentStatus);
  }

  /**
   * Obtém status apropriado baseado no tipo de pagamento
   */
  static getAppropriateStatuses(paymentType: PaymentType): PaymentStatus[] {
    switch (paymentType) {
      case PaymentType.INCOME:
        return [PaymentStatus.PENDING, PaymentStatus.RECEIVED, PaymentStatus.CANCELLED];
      case PaymentType.EXPENSE:
      case PaymentType.INSTALLMENT:
      case PaymentType.INVOICE:
        return [PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.OVERDUE, PaymentStatus.CANCELLED];
      default:
        return [PaymentStatus.PENDING, PaymentStatus.PAID];
    }
  }

  /**
   * Converte status antigo para novo formato
   */
  static migrateOldStatus(oldStatus: string, paymentType: PaymentType): PaymentStatus {
    // Migração de status antigos
    const normalizedStatus = oldStatus?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pago':
        return PaymentStatus.PAID;
      case 'recebido':
        return PaymentStatus.RECEIVED;
      case 'pendente':
        return PaymentStatus.PENDING;
      case 'atrasado':
        return PaymentStatus.OVERDUE;
      case 'cancelado':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  }

  /**
   * Calcula totais por status
   */
  static calculateTotals(compromissos: CompromissoComStatus[]): {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    received: number;
  } {
    return compromissos.reduce((acc, compromisso) => {
      acc.total += compromisso.valor;
      
      switch (compromisso.status_atual) {
        case PaymentStatus.PAID:
          acc.paid += compromisso.valor;
          break;
        case PaymentStatus.RECEIVED:
          acc.received += compromisso.valor;
          break;
        case PaymentStatus.OVERDUE:
          acc.overdue += compromisso.valor;
          break;
        case PaymentStatus.PENDING:
        default:
          acc.pending += compromisso.valor;
          break;
      }
      
      return acc;
    }, {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      received: 0
    });
  }

  /**
   * Filtra compromissos por status
   */
  static filterByStatus(
    compromissos: CompromissoComStatus[],
    status: PaymentStatus | PaymentStatus[]
  ): CompromissoComStatus[] {
    const statusArray = Array.isArray(status) ? status : [status];
    return compromissos.filter(c => statusArray.includes(c.status_atual));
  }

  /**
   * Verifica se compromisso está atrasado baseado na data
   */
  static isOverdue(compromisso: any, currentDate: Date = new Date()): boolean {
    if (!compromisso.data_vencimento) return false;
    
    const vencimento = new Date(compromisso.data_vencimento);
    return vencimento < currentDate;
  }

  /**
   * Aplica lógica de status automático baseado em regras
   */
  static applyAutomaticStatus(
    compromisso: any,
    currentDate: Date = new Date()
  ): PaymentStatus {
    // Se já tem status manual, manter
    if (compromisso.status_manual) {
      return compromisso.status_manual as PaymentStatus;
    }

    // Verificar se está atrasado
    if (this.isOverdue(compromisso, currentDate)) {
      return PaymentStatus.OVERDUE;
    }

    // Status padrão
    return PaymentStatus.PENDING;
  }
}