import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useContasParceladas } from '@/hooks/useContasParceladas';
import { useCartoes } from '@/hooks/useCartoes';
import { useFontesRenda } from '@/hooks/useFontesRenda';
import { EventoFinanceiro, EventosDia, FiltrosCalendario } from '@/components/calendario/tipos';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, format } from 'date-fns';

export const useEventosCalendario = (mesAtual: number, anoAtual: number) => {
  const { user } = useAuth();
  const { movimentacoes, isLoading: loadingMovimentacoes } = useMovimentacoes();
  const { contas, isLoading: loadingContas } = useContasParceladas();
  const { cartoes, isLoading: loadingCartoes } = useCartoes();
  const { fontes, isLoading: loadingFontes } = useFontesRenda();

  const [filtros, setFiltros] = useState<FiltrosCalendario>({
    mostrarMovimentacoes: true,
    mostrarParcelas: true,
    mostrarVencimentosCartao: true,
    mostrarRenda: true,
  });

  const isLoading = loadingMovimentacoes || loadingContas || loadingCartoes || loadingFontes;

  // Criar range de datas do mês atual
  const mesRange = useMemo(() => {
    const inicio = startOfMonth(new Date(anoAtual, mesAtual - 1));
    const fim = endOfMonth(new Date(anoAtual, mesAtual - 1));
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mesAtual, anoAtual]);

  // Processar eventos do calendário
  const eventosCalendario = useMemo(() => {
    if (!user || isLoading) return [];

    const eventos: EventoFinanceiro[] = [];

    // 1. Movimentações dos registros financeiros
    if (filtros.mostrarMovimentacoes) {
      movimentacoes.forEach(mov => {
        const dataMovimentacao = new Date(mov.data);
        if (dataMovimentacao.getMonth() === mesAtual - 1 && dataMovimentacao.getFullYear() === anoAtual) {
          eventos.push({
            id: `mov-${mov.id}`,
            data: dataMovimentacao,
            tipo: 'movimentacao',
            titulo: mov.nome || mov.categoria || 'Movimentação',
            valor: mov.valor,
            categoria: mov.categoria,
            isEntrada: mov.isEntrada,
            detalhes: {
              estabelecimento: mov.estabelecimento,
              observacao: mov.observacao,
            },
          });
        }
      });
    }

    // 2. Parcelas das contas parceladas
    if (filtros.mostrarParcelas) {
      contas.forEach(conta => {
        if (!conta.ativa) return;

        const dataPrimeiraParcela = new Date(conta.data_primeira_parcela);
        
        // Calcular todas as parcelas do ano atual
        for (let i = 0; i < conta.total_parcelas; i++) {
          const dataParcela = addMonths(dataPrimeiraParcela, i);
          
          if (dataParcela.getMonth() === mesAtual - 1 && dataParcela.getFullYear() === anoAtual) {
            eventos.push({
              id: `parcela-${conta.id}-${i}`,
              data: dataParcela,
              tipo: 'parcela',
              titulo: conta.nome,
              valor: conta.valor_parcela,
              isEntrada: false,
              detalhes: {
                numeroParcela: i + 1,
                totalParcelas: conta.total_parcelas,
              },
            });
          }
        }
      });
    }

    // 3. Vencimentos de cartão de crédito
    if (filtros.mostrarVencimentosCartao) {
      cartoes.forEach(cartao => {
        if (!cartao.ativo) return;

        const dataVencimento = new Date(anoAtual, mesAtual - 1, cartao.dia_vencimento);
        
        eventos.push({
          id: `cartao-${cartao.id}`,
          data: dataVencimento,
          tipo: 'vencimento-cartao',
          titulo: `Vencimento ${cartao.apelido}`,
          valor: 0, // Será calculado com base nas movimentações
          isEntrada: false,
          detalhes: {
            numeroCartao: cartao.ultimos_digitos,
          },
        });
      });
    }

    // 4. Fontes de renda (assumindo recebimento no dia 5 de cada mês como exemplo)
    if (filtros.mostrarRenda) {
      fontes.forEach(fonte => {
        if (!fonte.ativa) return;

        const dataRenda = new Date(anoAtual, mesAtual - 1, 5); // Dia 5 como padrão
        
        eventos.push({
          id: `renda-${fonte.id}`,
          data: dataRenda,
          tipo: 'renda',
          titulo: fonte.descricao || fonte.tipo,
          valor: fonte.valor,
          isEntrada: true,
        });
      });
    }

    return eventos;
  }, [user, isLoading, movimentacoes, contas, cartoes, fontes, filtros, mesAtual, anoAtual]);

  // Agrupar eventos por dia
  const eventosPorDia = useMemo(() => {
    const grupos = new Map<string, EventosDia>();

    // Inicializar todos os dias do mês
    mesRange.forEach(data => {
      const chave = format(data, 'yyyy-MM-dd');
      grupos.set(chave, {
        data,
        eventos: [],
        totalEntradas: 0,
        totalSaidas: 0,
        saldo: 0,
      });
    });

    // Agrupar eventos por dia
    eventosCalendario.forEach(evento => {
      const chave = format(evento.data, 'yyyy-MM-dd');
      const dia = grupos.get(chave);
      
      if (dia) {
        dia.eventos.push(evento);
        
        if (evento.isEntrada) {
          dia.totalEntradas += evento.valor;
        } else {
          dia.totalSaidas += evento.valor;
        }
        
        dia.saldo = dia.totalEntradas - dia.totalSaidas;
      }
    });

    return Array.from(grupos.values()).sort((a, b) => a.data.getTime() - b.data.getTime());
  }, [eventosCalendario, mesRange]);

  return {
    eventosPorDia,
    eventosCalendario,
    filtros,
    setFiltros,
    isLoading,
  };
};