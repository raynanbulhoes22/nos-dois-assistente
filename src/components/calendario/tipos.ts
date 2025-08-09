export interface EventoFinanceiro {
  id: string;
  data: Date;
  tipo: 'parcela' | 'vencimento-cartao' | 'renda';
  titulo: string;
  valor: number;
  categoria?: string;
  isEntrada: boolean;
  detalhes?: {
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
  mostrarParcelas: boolean;
  mostrarVencimentosCartao: boolean;
  mostrarRenda: boolean;
}