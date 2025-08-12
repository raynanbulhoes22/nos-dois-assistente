import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFontesRenda } from "./useFontesRenda";
import { useGastosFixos } from "./useGastosFixos";
import { useContasParceladas } from "./useContasParceladas";
import { useMovimentacoes } from "./useMovimentacoes";

export interface EventoConciliado {
  id: string;
  tipo_evento: 'fonte_renda' | 'gasto_fixo' | 'conta_parcelada';
  evento_id: string;
  nome: string;
  valor_esperado: number;
  valor_real?: number;
  data_esperada: Date;
  data_real?: Date;
  status: 'pendente' | 'conciliado' | 'atrasado' | 'nao_aplicavel';
  confianca_match: number;
  registro_financeiro_id?: string;
  observacoes?: string;
}

export interface StatusReconciliacao {
  total_eventos: number;
  conciliados: number;
  pendentes: number;
  atrasados: number;
  percentual_conclusao: number;
}

export interface SugestaoMatch {
  registro_id: string;
  evento_id: string;
  confianca: number;
  valor_registro: number;
  data_registro: Date;
  estabelecimento: string;
  motivo: string;
}

export const useReconciliacaoFinanceira = (mes?: number, ano?: number) => {
  const { user } = useAuth();
  const { fontes: fontesRenda } = useFontesRenda();
  const { gastosFixos } = useGastosFixos();
  const { contas: contasParceladas } = useContasParceladas();
  const { movimentacoes } = useMovimentacoes();

  const [eventosReconciliados, setEventosReconciliados] = useState<EventoConciliado[]>([]);
  const [sugestoes, setSugestoes] = useState<SugestaoMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mesAtual = mes || new Date().getMonth() + 1;
  const anoAtual = ano || new Date().getFullYear();

  // Função para calcular similaridade de texto
  const calcularSimilaridade = (texto1: string, texto2: string): number => {
    const t1 = texto1.toLowerCase().trim();
    const t2 = texto2.toLowerCase().trim();
    
    if (t1 === t2) return 100;
    if (t1.includes(t2) || t2.includes(t1)) return 80;
    
    // Verifica palavras em comum
    const palavras1 = t1.split(/\s+/);
    const palavras2 = t2.split(/\s+/);
    const comuns = palavras1.filter(p => palavras2.includes(p));
    
    if (comuns.length > 0) {
      const percentual = (comuns.length / Math.max(palavras1.length, palavras2.length)) * 100;
      return Math.min(percentual, 70);
    }
    
    return 0;
  };

  // Função para encontrar matches automáticos
  const encontrarMatches = (evento: any, tipo: string): SugestaoMatch[] => {
    if (!movimentacoes) return [];

    const matches: SugestaoMatch[] = [];
    const valorEsperado = Number(evento.valor || evento.valor_mensal || evento.valor_parcela);
    
    movimentacoes.forEach(mov => {
      const valorMovimento = Math.abs(Number(mov.valor));
      const dataMovimento = new Date(mov.data);
      const mesMovimento = dataMovimento.getMonth() + 1;
      const anoMovimento = dataMovimento.getFullYear();

      // Filtrar por mês/ano
      if (mesMovimento !== mesAtual || anoMovimento !== anoAtual) return;

      // Verificar se já foi usado
      const jaUsado = eventosReconciliados.some(e => e.registro_financeiro_id === mov.id);
      if (jaUsado) return;

      let score = 0;
      let motivos: string[] = [];

      // Tolerância de valor (±15%)
      const diferencaValor = Math.abs(valorMovimento - valorEsperado) / valorEsperado;
      if (diferencaValor <= 0.15) {
        score += 40;
        motivos.push(`Valor próximo (${diferencaValor <= 0.05 ? 'exato' : 'similar'})`);
      } else if (diferencaValor <= 0.30) {
        score += 20;
        motivos.push('Valor parcialmente compatível');
      }

      // Similaridade de nome/estabelecimento
      const nomeEvento = evento.nome || evento.tipo;
      const nomeMovimento = mov.estabelecimento || mov.nome || mov.categoria || '';
      const similNome = calcularSimilaridade(nomeEvento, nomeMovimento);
      
      if (similNome >= 70) {
        score += 30;
        motivos.push('Nome muito similar');
      } else if (similNome >= 40) {
        score += 15;
        motivos.push('Nome parcialmente similar');
      }

      // Verificar categoria compatível
      if (evento.categoria && mov.categoria) {
        const similCategoria = calcularSimilaridade(evento.categoria, mov.categoria);
        if (similCategoria >= 50) {
          score += 15;
          motivos.push('Categoria compatível');
        }
      }

      // Verificar forma de pagamento para fontes de renda
      if (tipo === 'fonte_renda' && mov.tipo_movimento === 'entrada') {
        score += 10;
        motivos.push('Tipo de movimento compatível');
      }

      // Verificar débito automático
      if (evento.debito_automatico && mov.forma_pagamento?.includes('débito')) {
        score += 10;
        motivos.push('Débito automático detectado');
      }

      // Só adicionar se score >= 30
      if (score >= 30) {
        matches.push({
          registro_id: mov.id,
          evento_id: evento.id,
          confianca: Math.min(score, 95), // Máximo 95% de confiança
          valor_registro: valorMovimento,
          data_registro: dataMovimento,
          estabelecimento: nomeMovimento,
          motivo: motivos.join(', ')
        });
      }
    });

    return matches.sort((a, b) => b.confianca - a.confianca);
  };

  // Processar eventos esperados para o mês
  const eventosEsperados = useMemo(() => {
    const eventos: EventoConciliado[] = [];

    // Processar fontes de renda
    fontesRenda?.filter(f => f.ativa).forEach(fonte => {
      eventos.push({
        id: `fonte_${fonte.id}`,
        tipo_evento: 'fonte_renda',
        evento_id: fonte.id,
        nome: fonte.tipo,
        valor_esperado: Number(fonte.valor),
        data_esperada: new Date(anoAtual, mesAtual - 1, 5), // Assumindo dia 5
        status: 'pendente',
        confianca_match: 0
      });
    });

    // Processar gastos fixos
    gastosFixos?.filter(g => g.ativo).forEach(gasto => {
      eventos.push({
        id: `gasto_${gasto.id}`,
        tipo_evento: 'gasto_fixo',
        evento_id: gasto.id,
        nome: gasto.nome,
        valor_esperado: Number(gasto.valor_mensal),
        data_esperada: new Date(anoAtual, mesAtual - 1, 10), // Assumindo dia 10
        status: 'pendente',
        confianca_match: 0
      });
    });

    // Processar contas parceladas
    contasParceladas?.filter(c => c.ativa).forEach(conta => {
      const dataInicio = new Date(conta.data_primeira_parcela);
      const parcelasPassadas = ((anoAtual - dataInicio.getFullYear()) * 12) + (mesAtual - (dataInicio.getMonth() + 1));
      
      if (parcelasPassadas >= 0 && parcelasPassadas < conta.total_parcelas) {
        eventos.push({
          id: `conta_${conta.id}`,
          tipo_evento: 'conta_parcelada',
          evento_id: conta.id,
          nome: conta.nome,
          valor_esperado: Number(conta.valor_parcela),
          data_esperada: new Date(anoAtual, mesAtual - 1, dataInicio.getDate()),
          status: 'pendente',
          confianca_match: 0
        });
      }
    });

    return eventos;
  }, [fontesRenda, gastosFixos, contasParceladas, mesAtual, anoAtual]);

  // Buscar reconciliações existentes
  useEffect(() => {
    const buscarReconciliacoes = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('eventos_conciliados')
          .select('*')
          .eq('user_id', user.id)
          .eq('mes_referencia', mesAtual)
          .eq('ano_referencia', anoAtual);

        if (error) throw error;

        // Merge com eventos esperados
        const eventosComStatus = eventosEsperados.map(esperado => {
          const reconciliado = data?.find(r => 
            r.tipo_evento === esperado.tipo_evento && 
            r.evento_id === esperado.evento_id
          );

          if (reconciliado) {
            return {
              ...esperado,
              id: reconciliado.id,
              status: reconciliado.status,
              valor_real: reconciliado.valor_real,
              data_real: reconciliado.data_real ? new Date(reconciliado.data_real) : undefined,
              registro_financeiro_id: reconciliado.registro_financeiro_id,
              confianca_match: reconciliado.confianca_match,
              observacoes: reconciliado.observacoes
            } as EventoConciliado;
          }

          return esperado;
        });

        setEventosReconciliados(eventosComStatus);

        // Gerar sugestões para eventos pendentes
        const eventosPendentes = eventosComStatus.filter(e => e.status === 'pendente');
        const todasSugestoes: SugestaoMatch[] = [];

        eventosPendentes.forEach(evento => {
          const eventoOriginal = fontesRenda?.find(f => f.id === evento.evento_id) ||
                                 gastosFixos?.find(g => g.id === evento.evento_id) ||
                                 contasParceladas?.find(c => c.id === evento.evento_id);
          
          if (eventoOriginal) {
            const matches = encontrarMatches(eventoOriginal, evento.tipo_evento);
            todasSugestoes.push(...matches);
          }
        });

        setSugestoes(todasSugestoes);

      } catch (error) {
        console.error('Erro ao buscar reconciliações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    buscarReconciliacoes();
  }, [user, eventosEsperados, movimentacoes, mesAtual, anoAtual]);

  // Calcular status
  const status = useMemo((): StatusReconciliacao => {
    const total = eventosReconciliados.length;
    const conciliados = eventosReconciliados.filter(e => e.status === 'conciliado').length;
    const atrasados = eventosReconciliados.filter(e => e.status === 'atrasado').length;
    const pendentes = total - conciliados - atrasados;

    return {
      total_eventos: total,
      conciliados,
      pendentes,
      atrasados,
      percentual_conclusao: total > 0 ? Math.round((conciliados / total) * 100) : 0
    };
  }, [eventosReconciliados]);

  // Função para reconciliar manualmente
  const reconciliarEvento = async (eventoId: string, registroId: string, observacoes?: string) => {
    if (!user) return;

    try {
      const evento = eventosReconciliados.find(e => e.id === eventoId);
      if (!evento) return;

      const registro = movimentacoes?.find(m => m.id === registroId);
      if (!registro) return;

      const { error } = await supabase
        .from('eventos_conciliados')
        .upsert({
          user_id: user.id,
          tipo_evento: evento.tipo_evento,
          evento_id: evento.evento_id,
          mes_referencia: mesAtual,
          ano_referencia: anoAtual,
          status: 'conciliado',
          valor_esperado: evento.valor_esperado,
          valor_real: Math.abs(Number(registro.valor)),
          data_esperada: evento.data_esperada.toISOString().split('T')[0],
          data_real: registro.data,
          registro_financeiro_id: registroId,
          confianca_match: 100,
          criado_manualmente: true,
          observacoes
        });

      if (error) throw error;

      // Atualizar estado local
      setEventosReconciliados(prev => 
        prev.map(e => e.id === eventoId ? {
          ...e,
          status: 'conciliado' as const,
          valor_real: Math.abs(Number(registro.valor)),
          data_real: new Date(registro.data),
          registro_financeiro_id: registroId,
          confianca_match: 100,
          observacoes
        } : e)
      );

    } catch (error) {
      console.error('Erro ao reconciliar evento:', error);
      throw error;
    }
  };

  return {
    eventosReconciliados,
    status,
    sugestoes,
    isLoading,
    reconciliarEvento,
    mesAtual,
    anoAtual
  };
};