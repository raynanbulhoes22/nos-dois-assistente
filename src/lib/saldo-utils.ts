import { supabase } from "@/integrations/supabase/client";

/**
 * Calcula o saldo atual de um mês específico
 */
export const calcularSaldoAtualMes = async (userId: string, mes: number, ano: number): Promise<number> => {
  try {
    // Buscar saldo inicial do mês
    const { data: orcamento } = await supabase
      .from('orcamentos_mensais')
      .select('saldo_inicial')
      .eq('user_id', userId)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle();
    
    const saldoInicial = orcamento?.saldo_inicial || 0;
    
    // Buscar todas as movimentações do mês (exceto Saldo Inicial)
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0);
    
    const { data: movimentacoes } = await supabase
      .from('registros_financeiros')
      .select('valor, tipo')
      .eq('user_id', userId)
      .gte('data', inicioMes.toISOString().split('T')[0])
      .lte('data', fimMes.toISOString().split('T')[0])
      .neq('categoria', 'Saldo Inicial'); // Excluir registros de saldo inicial para evitar duplicação
    
    // Calcular saldo atual
    let saldoAtual = saldoInicial;
    
    movimentacoes?.forEach(mov => {
      if (mov.tipo === 'entrada') {
        saldoAtual += Number(mov.valor);
      } else {
        saldoAtual -= Number(mov.valor);
      }
    });
    
    return saldoAtual;
  } catch (error) {
    console.error('Erro ao calcular saldo atual do mês:', error);
    return 0;
  }
};

/**
 * Calcula e cria o saldo inicial para um novo mês baseado no saldo atual do mês anterior
 */
export const calcularSaldoInicialNovoMes = async (userId: string, mes: number, ano: number, forcarRecalculo: boolean = false) => {
  try {
    // Verificar se já existe orçamento para o mês atual e se foi editado manualmente
    const { data: orcamentoExistente } = await supabase
      .from('orcamentos_mensais')
      .select('id, saldo_inicial, saldo_editado_manualmente')
      .eq('user_id', userId)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle();
    
    // Se existe e foi editado manualmente, não recalcular (a menos que seja forçado)
    if (orcamentoExistente?.saldo_editado_manualmente && !forcarRecalculo) {
      return orcamentoExistente.saldo_inicial || 0;
    }
    
    // Calcular o mês anterior
    let mesAnterior = mes - 1;
    let anoAnterior = ano;
    
    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior = ano - 1;
    }
    
    // Calcular o saldo atual do mês anterior (saldo final)
    const saldoAtualMesAnterior = await calcularSaldoAtualMes(userId, mesAnterior, anoAnterior);
    
    // O saldo inicial do novo mês é igual ao saldo atual do mês anterior
    const novoSaldoInicial = saldoAtualMesAnterior;
    
    if (orcamentoExistente) {
      // Atualizar orçamento existente
      await supabase
        .from('orcamentos_mensais')
        .update({ 
          saldo_inicial: novoSaldoInicial,
          saldo_editado_manualmente: false // Marcar como não editado manualmente após recálculo
        })
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
          meta_economia: 0,
          saldo_editado_manualmente: false
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
 * Recalcula em cascata todos os meses futuros que não foram editados manualmente
 */
export const recalcularSaldosEmCascata = async (userId: string, mesInicial: number, anoInicial: number) => {
  try {
    // Buscar todos os orçamentos futuros que não foram editados manualmente
    const { data: orcamentosFuturos } = await supabase
      .from('orcamentos_mensais')
      .select('mes, ano, saldo_editado_manualmente')
      .eq('user_id', userId)
      .eq('saldo_editado_manualmente', false)
      .order('ano', { ascending: true })
      .order('mes', { ascending: true });
    
    if (!orcamentosFuturos || orcamentosFuturos.length === 0) return;
    
    // Filtrar apenas os meses posteriores ao mês inicial
    const mesesParaRecalcular = orcamentosFuturos.filter(orc => {
      const dataOrcamento = new Date(orc.ano, orc.mes - 1);
      const dataInicial = new Date(anoInicial, mesInicial - 1);
      return dataOrcamento > dataInicial;
    });
    
    // Recalcular cada mês em ordem cronológica
    for (const orcamento of mesesParaRecalcular) {
      await calcularSaldoInicialNovoMes(userId, orcamento.mes, orcamento.ano, true);
    }
    
    console.log(`Recalculados ${mesesParaRecalcular.length} meses em cascata`);
    
  } catch (error) {
    console.error('Erro ao recalcular saldos em cascata:', error);
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