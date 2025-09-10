/**
 * Utilitários para trabalhar com datas nos compromissos financeiros
 */

/**
 * Extrai o dia de uma data no formato string (YYYY-MM-DD)
 * @param dataVencimento String da data no formato ISO (YYYY-MM-DD)
 * @returns Número do dia (1-31)
 */
export const extrairDiaVencimento = (dataVencimento: string): number => {
  if (!dataVencimento) return 1;
  return new Date(dataVencimento).getDate();
};

/**
 * Cria uma data de vencimento baseada no dia fornecido
 * @param dia Dia do mês (1-31)
 * @param mes Mês (opcional, usa mês atual se não fornecido)
 * @param ano Ano (opcional, usa ano atual se não fornecido)
 * @returns String da data no formato ISO (YYYY-MM-DD)
 */
export const criarDataVencimento = (dia: number, mes?: number, ano?: number): string => {
  const agora = new Date();
  const anoFinal = ano || agora.getFullYear();
  const mesFinal = mes !== undefined ? mes : agora.getMonth();
  
  return new Date(anoFinal, mesFinal, dia).toISOString().split('T')[0];
};

/**
 * Calcula a próxima data de vencimento baseada no dia
 * @param dia Dia do mês (1-31)
 * @returns String da data no formato ISO (YYYY-MM-DD)
 */
export const calcularProximaDataVencimento = (dia: number): string => {
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth();
  
  // Se o dia já passou no mês atual, usar mês seguinte
  const diaAtual = agora.getDate();
  const proximoMes = dia <= diaAtual ? mesAtual + 1 : mesAtual;
  
  return new Date(anoAtual, proximoMes, dia).toISOString().split('T')[0];
};