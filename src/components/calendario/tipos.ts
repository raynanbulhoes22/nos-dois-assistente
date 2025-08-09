export interface EventoFinanceiro {
  id: string;
  data: Date;
  tipo: 'movimentacao' | 'parcela' | 'vencimento-cartao' | 'renda';
  titulo: string;
  valor: number;
  categoria?: string;
  isEntrada: boolean;
  detalhes?: {
    estabelecimento?: string;
    observacao?: string;
    numeroCartao?: string;
    numeroParcela?: number;
    totalParcelas?: number;
  };
}

export interface EventosDia {
  data: Date;
  eventos: EventoFinanceiro[];
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

export interface FiltrosCalendario {
  mostrarMovimentacoes: boolean;
  mostrarParcelas: boolean;
  mostrarVencimentosCartao: boolean;
  mostrarRenda: boolean;
}