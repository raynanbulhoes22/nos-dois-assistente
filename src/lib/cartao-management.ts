import { supabase } from '@/integrations/supabase/client';
import { Cartao } from '@/hooks/useCartoes';

export interface TransacaoCartao {
  id: string;
  cartao_final?: string;
  ultimos_digitos?: string;
  apelido?: string;
  valor: number;
  data: string;
  titulo?: string;
  nome?: string;
  estabelecimento?: string;
  isEntrada: boolean;
  tipo_movimento?: string;
}

/**
 * Detecta se uma transação é um pagamento de fatura de cartão
 */
export const isPagamentoFatura = (transacao: TransacaoCartao): boolean => {
  if (!transacao.isEntrada) return false;

  const titulo = transacao.titulo || transacao.nome || '';
  const tituloLower = titulo.toLowerCase();
  
  const padroesPagamento = [
    'pagamento',
    'fatura',
    'cartão',
    'cartao',
    'débito automático',
    'debito automatico'
  ];

  return padroesPagamento.some(padrao => tituloLower.includes(padrao));
};

/**
 * Detecta tipo da transação relacionada a cartão
 */
export const detectarTipoTransacao = (transacao: TransacaoCartao): 'compra' | 'pagamento_fatura' | 'outro' => {
  if (isPagamentoFatura(transacao)) {
    return 'pagamento_fatura';
  }
  
  if (!transacao.isEntrada && (transacao.ultimos_digitos || transacao.cartao_final)) {
    return 'compra';
  }
  
  return 'outro';
};

/**
 * Processa uma compra no cartão (debita do limite disponível)
 */
export const processarCompraCartao = async (
  transacao: TransacaoCartao, 
  cartao: Cartao,
  userId: string
): Promise<boolean> => {
  try {
    const limiteAtual = parseFloat(cartao.limite_disponivel || '0') || cartao.limite || 0;
    const novoLimite = limiteAtual - transacao.valor;

    const { error } = await supabase
      .from('cartoes_credito')
      .update({ 
        limite_disponivel: novoLimite.toString()
      } as any)
      .eq('id', cartao.id)
      .eq('user_id', userId);

    if (error) throw error;

    console.log(`Compra processada: ${transacao.valor} debitado do cartão ${cartao.apelido}. Limite restante: ${novoLimite}`);
    return true;
  } catch (error) {
    console.error('Erro ao processar compra no cartão:', error);
    return false;
  }
};

/**
 * Processa pagamento de fatura (libera limite)
 */
export const processarPagamentoFatura = async (
  transacao: TransacaoCartao,
  cartao: Cartao,
  userId: string
): Promise<boolean> => {
  try {
    const limiteAtual = parseFloat((cartao.limite_disponivel || 0).toString());
    const novoLimite = limiteAtual + transacao.valor;

    const { error } = await supabase
      .from('cartoes_credito')
      .update({ 
        limite_disponivel: novoLimite.toString()
      } as any)
      .eq('id', cartao.id)
      .eq('user_id', userId);

    if (error) throw error;

    console.log(`Pagamento processado: ${transacao.valor} creditado ao cartão ${cartao.apelido}. Limite disponível: ${novoLimite}`);
    return true;
  } catch (error) {
    console.error('Erro ao processar pagamento de fatura:', error);
    return false;
  }
};

/**
 * Identifica cartão a partir de dados da transação
 */
export const identificarCartaoTransacao = (
  transacao: TransacaoCartao,
  cartoes: Cartao[]
): Cartao | null => {
  const cartoesAtivos = cartoes.filter(c => c.ativo);

  // 1. Prioridade: Apelido exato
  if (transacao.apelido) {
    const cartaoPorApelido = cartoesAtivos.find(
      c => c.apelido.toLowerCase() === transacao.apelido?.toLowerCase()
    );
    if (cartaoPorApelido) return cartaoPorApelido;
  }

  // 2. Segunda prioridade: Últimos dígitos
  if (transacao.ultimos_digitos) {
    const cartaoPorDigitos = cartoesAtivos.find(
      c => c.ultimos_digitos === transacao.ultimos_digitos
    );
    if (cartaoPorDigitos) return cartaoPorDigitos;
  }

  // 3. Terceira prioridade: cartao_final (compatibilidade)
  if (transacao.cartao_final) {
    const cartaoPorFinal = cartoesAtivos.find(
      c => transacao.cartao_final?.includes(c.ultimos_digitos)
    );
    if (cartaoPorFinal) return cartaoPorFinal;
  }

  return null;
};

/**
 * Processa todas as transações de cartão e atualiza limites automaticamente
 */
export const processarTransacoesCartao = async (
  transacoes: TransacaoCartao[],
  cartoes: Cartao[],
  userId: string
): Promise<{ processadas: number; erros: number }> => {
  let processadas = 0;
  let erros = 0;

  for (const transacao of transacoes) {
    try {
      const tipoTransacao = detectarTipoTransacao(transacao);
      
      if (tipoTransacao === 'outro') continue;

      const cartao = identificarCartaoTransacao(transacao, cartoes);
      if (!cartao) continue;

      let sucesso = false;

      if (tipoTransacao === 'compra') {
        sucesso = await processarCompraCartao(transacao, cartao, userId);
      } else if (tipoTransacao === 'pagamento_fatura') {
        sucesso = await processarPagamentoFatura(transacao, cartao, userId);
      }

      if (sucesso) {
        processadas++;
      } else {
        erros++;
      }
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      erros++;
    }
  }

  return { processadas, erros };
};

/**
 * Calcula limite disponível atual baseado nas transações
 */
export const calcularLimiteDisponivel = (
  cartao: Cartao,
  transacoes: TransacaoCartao[]
): number => {
  const limiteTotal = cartao.limite || 0;
  
  // Se já tem limite_disponivel definido, usar ele
  if (cartao.limite_disponivel !== undefined && cartao.limite_disponivel !== null) {
    return parseFloat((cartao.limite_disponivel || 0).toString());
  }

  // Senão, calcular baseado nas transações
  const transacoesDoCartao = transacoes.filter(t => {
    const cartaoEncontrado = identificarCartaoTransacao(t, [cartao]);
    return cartaoEncontrado?.id === cartao.id;
  });

  const gastoTotal = transacoesDoCartao
    .filter(t => !t.isEntrada)
    .reduce((total, t) => total + t.valor, 0);

  const pagamentosTotal = transacoesDoCartao
    .filter(t => t.isEntrada && isPagamentoFatura(t))
    .reduce((total, t) => total + t.valor, 0);

  return limiteTotal - gastoTotal + pagamentosTotal;
};

/**
 * Verifica alertas de limite do cartão
 */
export const verificarAlertasCartao = (cartao: Cartao): string[] => {
  const alertas: string[] = [];
  const limiteDisponivel = parseFloat((cartao.limite_disponivel || 0).toString());
  const limiteTotal = cartao.limite || 0;

  if (limiteDisponivel < 0) {
    alertas.push(`Cartão ${cartao.apelido} está com limite negativo: R$ ${limiteDisponivel.toFixed(2)}`);
  } else if (limiteDisponivel < limiteTotal * 0.1) {
    alertas.push(`Cartão ${cartao.apelido} com limite baixo: apenas R$ ${limiteDisponivel.toFixed(2)} disponível`);
  }

  // Verificar vencimento próximo
  if (cartao.dia_vencimento) {
    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const diasParaVencimento = cartao.dia_vencimento - diaAtual;
    
    if (diasParaVencimento <= 3 && diasParaVencimento > 0) {
      alertas.push(`Fatura do cartão ${cartao.apelido} vence em ${diasParaVencimento} dia(s)`);
    }
  }

  return alertas;
};