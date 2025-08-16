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
    console.log(`📊 Saldo inicial ${mes}/${ano}: ${saldoInicial}`);
    
    // Buscar todas as movimentações do mês (exceto Saldo Inicial para evitar duplicação)
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0);
    
    const { data: movimentacoes } = await supabase
      .from('registros_financeiros')
      .select('valor, tipo_movimento')
      .eq('user_id', userId)
      .gte('data', inicioMes.toISOString().split('T')[0])
      .lte('data', fimMes.toISOString().split('T')[0])
      .neq('categoria', 'Saldo Inicial'); // Excluir registros de saldo inicial para evitar duplicação
    
    // Calcular saldo atual = saldo inicial + movimentações
    let saldoAtual = saldoInicial;
    let totalMovimentacoes = 0;
    
    movimentacoes?.forEach(mov => {
      if (mov.tipo_movimento === 'entrada') {
        const valor = Number(mov.valor);
        saldoAtual += valor;
        totalMovimentacoes += valor;
      } else if (mov.tipo_movimento === 'saida') {
        const valor = Number(mov.valor);
        saldoAtual -= valor;
        totalMovimentacoes -= valor;
      }
    });
    
    console.log(`💰 Cálculo ${mes}/${ano}: Inicial ${saldoInicial} + Movimentações ${totalMovimentacoes} = ${saldoAtual}`);
    
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
    
    // Não criar mais registros financeiros para saldo inicial
    // O saldo inicial é mantido apenas em orcamentos_mensais.saldo_inicial
    
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

/**
 * Garante que o saldo inicial do mês tenha continuidade com o mês anterior
 * e força recálculo em cascata se necessário
 */
export const garantirContinuidadeSaldos = async (userId: string, mes: number, ano: number) => {
  try {
    console.log(`🔗 Verificando continuidade para ${mes}/${ano}`);
    
    // Calcular o mês anterior
    let mesAnterior = mes - 1;
    let anoAnterior = ano;
    
    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior = ano - 1;
    }
    
    // Calcular o saldo atual do mês anterior (saldo final)
    const saldoAtualMesAnterior = await calcularSaldoAtualMes(userId, mesAnterior, anoAnterior);
    console.log(`💰 Saldo final do mês anterior (${mesAnterior}/${anoAnterior}): ${saldoAtualMesAnterior}`);
    
    // Verificar o orçamento do mês atual
    const { data: orcamentoAtual } = await supabase
      .from('orcamentos_mensais')
      .select('id, saldo_inicial, saldo_editado_manualmente')
      .eq('user_id', userId)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle();
    
    console.log(`📊 Orçamento atual (${mes}/${ano}):`, orcamentoAtual);
    
    // Se o saldo inicial do mês atual não bate com o saldo final do anterior
    // ou se não existe orçamento, forçar recálculo
    const diferenca = orcamentoAtual ? Math.abs((orcamentoAtual.saldo_inicial || 0) - saldoAtualMesAnterior) : Infinity;
    
    if (!orcamentoAtual || diferenca > 0.01) {
      console.log(`🔄 Corrigindo continuidade: Diferença de ${diferenca.toFixed(2)} detectada`);
      console.log(`   Saldo anterior: ${saldoAtualMesAnterior}`);
      console.log(`   Saldo atual: ${orcamentoAtual?.saldo_inicial || 0}`);
      
      // Atualizar ou criar orçamento com o saldo correto
      if (orcamentoAtual) {
        await supabase
          .from('orcamentos_mensais')
          .update({ 
            saldo_inicial: saldoAtualMesAnterior,
            saldo_editado_manualmente: false 
          })
          .eq('id', orcamentoAtual.id);
      } else {
        await supabase
          .from('orcamentos_mensais')
          .insert({
            user_id: userId,
            mes,
            ano,
            saldo_inicial: saldoAtualMesAnterior,
            meta_economia: 0,
            saldo_editado_manualmente: false
          });
      }
      
      // Não criar mais registros financeiros para saldo inicial
      // O saldo inicial é mantido apenas em orcamentos_mensais.saldo_inicial
      
      console.log(`✅ Continuidade corrigida para ${mes}/${ano}`);
      
      // Recalcular todos os meses futuros em cascata
      await recalcularSaldosEmCascata(userId, mes, ano);
    } else {
      console.log(`✅ Continuidade já está correta para ${mes}/${ano}`);
    }
    
  } catch (error) {
    console.error('Erro ao garantir continuidade de saldos:', error);
  }
};