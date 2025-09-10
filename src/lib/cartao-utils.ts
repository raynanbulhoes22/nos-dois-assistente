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

/**
 * Gera apelido inteligente para cartão baseado no contexto da transação
 */
export const gerarApelidoInteligente = (
  ultimosDigitos: string,
  contexto?: string
): string => {
  const contextoLower = (contexto || '').toLowerCase();
  
  // Padrões conhecidos de bancos/instituições
  const padroesBancos = [
    { pattern: /nubank|nu\s*bank/i, nome: 'NuBank' },
    { pattern: /bradesco/i, nome: 'Bradesco' },
    { pattern: /santander/i, nome: 'Santander' },
    { pattern: /itau|itaú/i, nome: 'Itaú' },
    { pattern: /bb|banco.*brasil/i, nome: 'Banco do Brasil' },
    { pattern: /caixa/i, nome: 'Caixa' },
    { pattern: /inter/i, nome: 'Inter' },
    { pattern: /c6\s*bank|c6bank/i, nome: 'C6 Bank' },
    { pattern: /sicredi/i, nome: 'Sicredi' },
    { pattern: /original/i, nome: 'Original' },
    { pattern: /will\s*bank/i, nome: 'Will Bank' }
  ];

  // Tentar identificar o banco pelo contexto
  for (const padrao of padroesBancos) {
    if (padrao.pattern.test(contextoLower)) {
      return `${padrao.nome} ••••${ultimosDigitos}`;
    }
  }

  // Fallback genérico
  return `Cartão ••••${ultimosDigitos}`;
};

/**
 * Detecta dados de cartão a partir de uma transação
 */
export const detectarDadosCartao = (
  transacao: TransacaoCartao
): { ultimosDigitos: string; apelido: string } | null => {
  let ultimosDigitos = '';

  // Prioridade 1: usar ultimos_digitos se disponível
  if (transacao.ultimos_digitos) {
    ultimosDigitos = transacao.ultimos_digitos;
  }
  // Prioridade 2: extrair de cartao_final usando regex
  else if (transacao.cartao_final) {
    const match = transacao.cartao_final.match(/(\d{4})$/);
    if (match) {
      ultimosDigitos = match[1];
    }
  }

  if (!ultimosDigitos) return null;

  // Gerar contexto a partir da transação
  const contexto = [
    (transacao as any).titulo,
    (transacao as any).nome,
    (transacao as any).estabelecimento,
    (transacao as any).instituicao
  ].filter(Boolean).join(' ');

  const apelido = gerarApelidoInteligente(ultimosDigitos, contexto);

  return { ultimosDigitos, apelido };
};

/**
 * Cria um cartão automaticamente baseado nos dados da transação
 */
export const criarCartaoAutomatico = async (
  dadosCartao: { ultimosDigitos: string; apelido: string },
  userId: string
): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { error } = await supabase
      .from('compromissos_financeiros')
      .insert({
        user_id: userId,
        tipo_compromisso: 'cartao_credito',
        nome: dadosCartao.apelido,
        ativo: true,
        parcelas_pagas: 0,
        data_referencia: new Date().toISOString().split('T')[0],
        dados_especificos: {
          apelido: dadosCartao.apelido,
          ultimos_digitos: dadosCartao.ultimosDigitos,
          limite: null
        }
      });

    if (error) {
      console.error('Erro ao criar cartão automaticamente:', error);
      return false;
    }

    console.log(`Cartão criado automaticamente: ${dadosCartao.apelido}`);
    return true;
  } catch (error) {
    console.error('Erro ao criar cartão automaticamente:', error);
    return false;
  }
};

/**
 * Detecta e cria cartões automaticamente para transações órfãs
 */
export const detectarECriarCartoesAutomaticos = async (
  transacoes: TransacaoCartao[],
  cartoesExistentes: any[],
  userId: string
): Promise<{ cartoesDetectados: Array<{ ultimosDigitos: string; apelido: string }>; cartoesCriados: number }> => {
  const cartoesDetectados: Array<{ ultimosDigitos: string; apelido: string }> = [];
  const digitosExistentes = new Set(cartoesExistentes.map(c => c.ultimos_digitos));
  let cartoesCriados = 0;

  // Usar Map para evitar duplicações durante o processamento
  const cartoesParaCriar = new Map<string, { ultimosDigitos: string; apelido: string }>();

  for (const transacao of transacoes) {
    // Pular se for entrada (não queremos cartões para entradas)
    if (transacao.isEntrada) continue;

    // Tentar encontrar cartão existente
    const cartaoExistente = encontrarCartaoParaTransacao(transacao, cartoesExistentes);
    if (cartaoExistente) continue;

    // Detectar dados do cartão
    const dadosDetectados = detectarDadosCartao(transacao);
    if (!dadosDetectados) continue;

    // Verificar se já temos um cartão com esses dígitos (existentes ou já detectados)
    if (digitosExistentes.has(dadosDetectados.ultimosDigitos)) continue;
    if (cartoesParaCriar.has(dadosDetectados.ultimosDigitos)) continue;

    // Adicionar à lista de cartões para criar
    cartoesParaCriar.set(dadosDetectados.ultimosDigitos, dadosDetectados);
    digitosExistentes.add(dadosDetectados.ultimosDigitos);
  }

  // Criar cartões únicos detectados
  for (const dadosCartao of cartoesParaCriar.values()) {
    cartoesDetectados.push(dadosCartao);
    
    const sucesso = await criarCartaoAutomatico(dadosCartao, userId);
    if (sucesso) {
      cartoesCriados++;
    }
  }

  return { cartoesDetectados, cartoesCriados };
};