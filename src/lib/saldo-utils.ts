import { supabase } from "@/integrations/supabase/client";

/**
 * Calcula e cria o saldo inicial para um novo mês baseado no saldo do mês anterior
 * mais todas as movimentações que aconteceram
 */
export const calcularSaldoInicialNovoMes = async (userId: string, mes: number, ano: number) => {
  try {
    // Calcular o mês anterior
    let mesAnterior = mes - 1;
    let anoAnterior = ano;
    
    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior = ano - 1;
    }
    
    // Buscar o saldo inicial do mês anterior
    const { data: orcamentoAnterior } = await supabase
      .from('orcamentos_mensais')
      .select('saldo_inicial')
      .eq('user_id', userId)
      .eq('mes', mesAnterior)
      .eq('ano', anoAnterior)
      .maybeSingle();
    
    const saldoInicialAnterior = orcamentoAnterior?.saldo_inicial || 0;
    
    // Buscar todas as movimentações do mês anterior
    const inicioMesAnterior = new Date(anoAnterior, mesAnterior - 1, 1);
    const fimMesAnterior = new Date(anoAnterior, mesAnterior, 0);
    
    const { data: movimentacoes } = await supabase
      .from('registros_financeiros')
      .select('valor, tipo')
      .eq('user_id', userId)
      .gte('data', inicioMesAnterior.toISOString().split('T')[0])
      .lte('data', fimMesAnterior.toISOString().split('T')[0]);
    
    // Calcular o total de entradas e saídas do mês anterior
    let totalEntradas = 0;
    let totalSaidas = 0;
    
    movimentacoes?.forEach(mov => {
      if (mov.tipo === 'entrada') {
        totalEntradas += Number(mov.valor);
      } else {
        totalSaidas += Number(mov.valor);
      }
    });
    
    // Saldo inicial do novo mês = saldo inicial anterior + entradas - saídas
    const novoSaldoInicial = saldoInicialAnterior + totalEntradas - totalSaidas;
    
    // Verificar se já existe orçamento para o mês atual
    const { data: orcamentoExistente } = await supabase
      .from('orcamentos_mensais')
      .select('id, saldo_inicial')
      .eq('user_id', userId)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle();
    
    if (orcamentoExistente) {
      // Atualizar orçamento existente
      await supabase
        .from('orcamentos_mensais')
        .update({ saldo_inicial: novoSaldoInicial })
        .eq('id', orcamentoExistente.id);
    } else {
      // Criar novo orçamento
      await supabase
        .from('orcamentos_mensais')
        .insert({
          user_id: userId,
          mes,
          ano,
          saldo_inicial: novoSaldoInicial,
          meta_economia: 0
        });
    }
    
    // Criar registro financeiro com o saldo inicial para o novo mês
    const primeiroDiaMes = new Date(ano, mes - 1, 1);
    
    // Verificar se já existe registro de saldo inicial para este mês
    const { data: registroExistente } = await supabase
      .from('registros_financeiros')
      .select('id')
      .eq('user_id', userId)
      .eq('categoria', 'Saldo Inicial')
      .eq('data', primeiroDiaMes.toISOString().split('T')[0])
      .maybeSingle();
    
    if (!registroExistente && novoSaldoInicial !== 0) {
      await supabase
        .from('registros_financeiros')
        .insert({
          user_id: userId,
          valor: Math.abs(novoSaldoInicial),
          data: primeiroDiaMes.toISOString().split('T')[0],
          tipo: novoSaldoInicial >= 0 ? 'entrada' : 'saida',
          categoria: 'Saldo Inicial',
          nome: `Saldo Inicial - ${new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
          observacao: 'Saldo inicial calculado automaticamente baseado no mês anterior',
          origem: 'sistema'
        });
    }
    
    return novoSaldoInicial;
    
  } catch (error) {
    console.error('Erro ao calcular saldo inicial do novo mês:', error);
    return 0;
  }
};

/**
 * Hook para garantir que o saldo inicial do mês atual existe
 */
export const garantirSaldoInicialMesAtual = async (userId: string) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  // Verificar se já existe orçamento para o mês atual
  const { data: orcamentoAtual } = await supabase
    .from('orcamentos_mensais')
    .select('saldo_inicial')
    .eq('user_id', userId)
    .eq('mes', mesAtual)
    .eq('ano', anoAtual)
    .maybeSingle();
  
  // Se não existe, calcular e criar
  if (!orcamentoAtual) {
    return await calcularSaldoInicialNovoMes(userId, mesAtual, anoAtual);
  }
  
  return orcamentoAtual.saldo_inicial || 0;
};