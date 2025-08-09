import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useContasParceladas } from '@/hooks/useContasParceladas';
import { useFontesRenda } from '@/hooks/useFontesRenda';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';

export interface PrevisaoMensal {
  mes: number;
  ano: number;
  receitas: number;
  gastosFixos: number;
  saldoProjetado: number;
  status: 'excelente' | 'positivo' | 'critico' | 'deficit' | 'sem-dados';
  compromissos: CompromissoMensal[];
}

export interface CompromissoMensal {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
  tipo: 'parcelamento' | 'financiamento';
  parcela: number;
  totalParcelas: number;
  venceFinal?: Date;
}

export interface AlertaFinanceiro {
  id: string;
  tipo: 'deficit' | 'termino' | 'economia' | 'oportunidade';
  titulo: string;
  descricao: string;
  mes?: number;
  ano?: number;
  valor?: number;
  prioridade: 'alta' | 'media' | 'baixa';
}

export const usePrevisibilidadeFinanceira = () => {
  const { user } = useAuth();
  const { contas, getTotalParcelasAtivas } = useContasParceladas();
  const { fontes: fontesRenda, getTotalRendaAtiva } = useFontesRenda();
  const { movimentacoes } = useMovimentacoes();
  
  const [previsoes, setPrevisoes] = useState<PrevisaoMensal[]>([]);
  const [alertas, setAlertas] = useState<AlertaFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function - must be declared before useMemo hooks that use it
  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  // Calcular previsões para os próximos 12 meses
  const calcularPrevisoes12Meses = useMemo(() => {
    if (!user || !contas.length) return [];

    const hoje = new Date();
    const previsoesMensais: PrevisaoMensal[] = [];
    const rendaMensal = getTotalRendaAtiva();

    for (let i = 0; i < 12; i++) {
      const dataProjecao = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mes = dataProjecao.getMonth() + 1;
      const ano = dataProjecao.getFullYear();

      // Calcular compromissos do mês
      const compromissosDoMes = contas
        .filter(conta => {
          const dataInicio = new Date(conta.data_primeira_parcela);
          const mesesDecorridos = (dataProjecao.getFullYear() - dataInicio.getFullYear()) * 12 + 
                                 (dataProjecao.getMonth() - dataInicio.getMonth());
          const parcelaAtual = mesesDecorridos + 1;
          const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
          
          return parcelaAtual > 0 && 
                 parcelaAtual <= conta.total_parcelas && 
                 parcelaAtual > conta.parcelas_pagas &&
                 parcelasRestantes > 0;
        })
        .map(conta => {
          const dataInicio = new Date(conta.data_primeira_parcela);
          const mesesDecorridos = (dataProjecao.getFullYear() - dataInicio.getFullYear()) * 12 + 
                                 (dataProjecao.getMonth() - dataInicio.getMonth());
          const parcelaAtual = mesesDecorridos + 1;
          
          const venceFinal = new Date(dataInicio);
          venceFinal.setMonth(venceFinal.getMonth() + conta.total_parcelas - 1);

          return {
            id: conta.id,
            nome: conta.nome,
            valor: conta.valor_parcela,
            categoria: conta.categoria || 'Outros',
            tipo: conta.tipo_financiamento as 'parcelamento' | 'financiamento',
            parcela: parcelaAtual,
            totalParcelas: conta.total_parcelas,
            venceFinal
          };
        });

      const gastosFixos = compromissosDoMes.reduce((total, c) => total + c.valor, 0);
      const saldoProjetado = rendaMensal - gastosFixos;
      
      // Nova lógica granular baseada no percentual da renda disponível
      let status: 'excelente' | 'positivo' | 'critico' | 'deficit' | 'sem-dados' = 'sem-dados';
      
      if (rendaMensal === 0) {
        status = 'sem-dados';
      } else if (saldoProjetado < 0) {
        status = 'deficit';
      } else {
        const percentualDisponivel = (saldoProjetado / rendaMensal) * 100;
        if (percentualDisponivel > 30) {
          status = 'excelente';
        } else if (percentualDisponivel > 10) {
          status = 'positivo';
        } else {
          status = 'critico';
        }
      }

      previsoesMensais.push({
        mes,
        ano,
        receitas: rendaMensal,
        gastosFixos,
        saldoProjetado,
        status,
        compromissos: compromissosDoMes
      });
    }

    return previsoesMensais;
  }, [contas, getTotalRendaAtiva, user]);

  // Gerar alertas baseados nas previsões
  const gerarAlertas = useMemo(() => {
    const alertasGerados: AlertaFinanceiro[] = [];

    previsoes.forEach((previsao, index) => {
      // Alerta de déficit
      if (previsao.status === 'deficit') {
        alertasGerados.push({
          id: `deficit-${previsao.mes}-${previsao.ano}`,
          tipo: 'deficit',
          titulo: 'Déficit Projetado',
          descricao: `Em ${getMesNome(previsao.mes)}/${previsao.ano} você terá déficit de R$ ${Math.abs(previsao.saldoProjetado).toFixed(2)}`,
          mes: previsao.mes,
          ano: previsao.ano,
          valor: Math.abs(previsao.saldoProjetado),
          prioridade: 'alta'
        });
      }

      // Alerta de compromissos terminando
      previsao.compromissos.forEach(compromisso => {
        if (compromisso.parcela === compromisso.totalParcelas) {
          alertasGerados.push({
            id: `termino-${compromisso.id}`,
            tipo: 'termino',
            titulo: 'Compromisso Finalizando',
            descricao: `O ${compromisso.nome} termina em ${getMesNome(previsao.mes)}/${previsao.ano}. Você liberará R$ ${compromisso.valor.toFixed(2)}/mês`,
            mes: previsao.mes,
            ano: previsao.ano,
            valor: compromisso.valor,
            prioridade: 'media'
          });
        }
      });
    });

    return alertasGerados;
  }, [previsoes]);

  const getProximosDeficits = () => {
    return previsoes.filter(p => p.status === 'deficit').slice(0, 3);
  };

  const getProximosTerminos = () => {
    const terminos: Array<{ nome: string; mes: number; ano: number; valor: number }> = [];
    
    previsoes.forEach(previsao => {
      previsao.compromissos.forEach(compromisso => {
        if (compromisso.parcela === compromisso.totalParcelas) {
          terminos.push({
            nome: compromisso.nome,
            mes: previsao.mes,
            ano: previsao.ano,
            valor: compromisso.valor
          });
        }
      });
    });

    return terminos.slice(0, 3);
  };

  const getTotalCompromissosAtivos = () => {
    return getTotalParcelasAtivas();
  };

  const getSaldoProjetado6Meses = () => {
    const primeiros6Meses = previsoes.slice(0, 6);
    return primeiros6Meses.reduce((total, p) => total + p.saldoProjetado, 0);
  };

  useEffect(() => {
    setPrevisoes(calcularPrevisoes12Meses);
    setIsLoading(false);
  }, [
    user?.id, 
    fontesRenda.length, 
    getTotalRendaAtiva(), 
    contas.length, 
    getTotalParcelasAtivas()
  ]);

  useEffect(() => {
    setAlertas(gerarAlertas);
  }, [
    previsoes.length,
    user?.id
  ]);

  return {
    previsoes,
    alertas,
    isLoading,
    getProximosDeficits,
    getProximosTerminos,
    getTotalCompromissosAtivos,
    getSaldoProjetado6Meses,
    getMesNome
  };
};