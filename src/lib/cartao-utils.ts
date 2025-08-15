import { Cartao } from '@/hooks/useCartoes';

export interface TransacaoCartao {
  id: string;
  cartao_final?: string;
  ultimos_digitos?: string;
  apelido?: string;
  valor: number;
  data: string;
  isEntrada: boolean;
}

/**
 * Encontra o cartão correspondente a uma transação usando lógica de prioridade:
 * 1. Primeiro tenta pelo apelido exato
 * 2. Depois pelos últimos dígitos
 * 3. Por último pelo cartao_final (compatibilidade com dados antigos)
 */
export const encontrarCartaoParaTransacao = (
  transacao: TransacaoCartao,
  cartoes: Cartao[]
): Cartao | null => {
  if (!cartoes || cartoes.length === 0) return null;

  const cartoesAtivos = cartoes.filter(cartao => cartao.ativo);

  // 1. Prioridade: Apelido exato
  if (transacao.apelido) {
    const cartaoPorApelido = cartoesAtivos.find(
      cartao => cartao.apelido.toLowerCase() === transacao.apelido?.toLowerCase()
    );
    if (cartaoPorApelido) return cartaoPorApelido;
  }

  // 2. Segunda prioridade: Últimos dígitos
  if (transacao.ultimos_digitos) {
    const cartaoPorDigitos = cartoesAtivos.find(
      cartao => cartao.ultimos_digitos === transacao.ultimos_digitos
    );
    if (cartaoPorDigitos) return cartaoPorDigitos;
  }

  // 3. Terceira prioridade: cartao_final (compatibilidade)
  if (transacao.cartao_final) {
    const cartaoPorFinal = cartoesAtivos.find(
      cartao => transacao.cartao_final?.includes(cartao.ultimos_digitos)
    );
    if (cartaoPorFinal) return cartaoPorFinal;
  }

  return null;
};

/**
 * Filtra transações de cartão para um cartão específico no período
 */
export const filtrarTransacoesDoCartao = (
  transacoes: TransacaoCartao[],
  cartao: Cartao,
  mes: number,
  ano: number
): TransacaoCartao[] => {
  return transacoes.filter(transacao => {
    // Só considera gastos (não entradas)
    if (transacao.isEntrada) return false;

    const dataTransacao = new Date(transacao.data);
    const mesTransacao = dataTransacao.getMonth() + 1;
    const anoTransacao = dataTransacao.getFullYear();

    // Verifica se é do período correto
    if (mesTransacao !== mes || anoTransacao !== ano) return false;

    // Verifica se a transação é deste cartão
    const cartaoEncontrado = encontrarCartaoParaTransacao(transacao, [cartao]);
    return cartaoEncontrado?.id === cartao.id;
  });
};

/**
 * Calcula o valor total gasto em um cartão no período
 */
export const calcularGastoCartao = (
  transacoes: TransacaoCartao[],
  cartao: Cartao,
  mes: number,
  ano: number
): number => {
  const transacoesDoCartao = filtrarTransacoesDoCartao(transacoes, cartao, mes, ano);
  return transacoesDoCartao.reduce((total, transacao) => total + transacao.valor, 0);
};

/**
 * Calcula valor da fatura do cartão (gastos do mês anterior ao vencimento)
 */
export const calcularValorFaturaCartao = (
  transacoes: TransacaoCartao[],
  cartao: Cartao,
  mesVencimento: number,
  anoVencimento: number
): number => {
  // Calcula período de faturamento (mês anterior ao vencimento)
  const mesRef = mesVencimento === 1 ? 12 : mesVencimento - 1;
  const anoRef = mesVencimento === 1 ? anoVencimento - 1 : anoVencimento;
  
  return calcularGastoCartao(transacoes, cartao, mesRef, anoRef);
};

/**
 * Detecta se uma transação é um pagamento de fatura de cartão
 */
export const isPagamentoFatura = (transacao: TransacaoCartao): boolean => {
  if (!transacao.isEntrada) return false;

  const titulo = (transacao as any).titulo || (transacao as any).nome || '';
  const tituloLower = titulo.toLowerCase();
  
  return tituloLower.includes('pagamento') || 
         tituloLower.includes('fatura') ||
         tituloLower.includes('cartão') ||
         tituloLower.includes('cartao');
};