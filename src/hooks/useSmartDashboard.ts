import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useGastosFixos } from "@/hooks/useGastosFixos";
import { useContasParceladas } from "@/hooks/useContasParceladas";
import { useCartoes } from "@/hooks/useCartoes";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useSaldoEsperado } from "@/hooks/useSaldoEsperado";
import { useFinancialCache } from "@/contexts/FinancialDataContext";
import { supabase } from "@/integrations/supabase/client";

export interface SmartInsight {
  id: string;
  tipo: 'critico' | 'alerta' | 'sucesso' | 'info';
  titulo: string;
  mensagem: string;
  impacto?: string;
  acao?: string;
  confianca: 'alta' | 'media' | 'baixa';
}

export interface FinancialHealth {
  score: number; // 0-100
  status: 'excelente' | 'bom' | 'atencao' | 'critico';
  tendencia: 'melhorando' | 'estavel' | 'piorando';
}

export interface Achievement {
  id: string;
  titulo: string;
  descricao: string;
  progresso: number; // 0-100
  meta: number;
  atual: number;
  icone: string;
  concluido: boolean;
}

export interface NextCommitment {
  id: string;
  nome: string;
  valor: number;
  vencimento: Date;
  tipo: 'gasto_fixo' | 'parcela' | 'fatura';
  categoria?: string;
}

export interface LongTermProjection {
  mes: number;
  ano: number;
  saldoProjetado: number;
  rendaEsperada: number;
  gastosEsperados: number;
  confianca: 'alta' | 'media' | 'baixa';
}

export interface SmartDashboardData {
  // Status Financeiro Atual
  saldoTotal: number;
  saldoInicial: number;
  saldoMovimentacoes: number;
  rendaMes: number;
  gastosMes: number;
  saldoEsperado: number;
  
  // Saúde Financeira
  saudeFinanceira: FinancialHealth;
  
  // Próximos Compromissos
  proximosCompromissos: NextCommitment[];
  
  // Insights Comportamentais
  insights: SmartInsight[];
  
  // Conquistas
  conquistas: Achievement[];
  
  // Projeção de Longo Prazo
  projecaoTrimestre: LongTermProjection[];
  
  // Dados para análise
  categoriasMaisGastas: Array<{ categoria: string; valor: number; percentual: number }>;
  padraoGastos: {
    diaMaisGasto: string;
    hoarioMaisGasto: string;
    estabelecimentoFavorito: string;
  };
  
  // Estado de carregamento
  isLoading: boolean;
  error?: string;
}

export const useSmartDashboard = (): SmartDashboardData => {
  const { user } = useAuth();
  const { getFromCache, setCache } = useFinancialCache();
  
  // Hooks de dados
  const { movimentacoes, entradas, saidas, isLoading: movLoading } = useMovimentacoes();
  const { getTotalRendaAtiva } = useFontesRenda();
  const { getTotalGastosFixosAtivos } = useGastosFixos();
  const { getTotalParcelasAtivas } = useContasParceladas();
  const { cartoes } = useCartoes();
  const { getOrcamentoAtual } = useOrcamentos();
  
  const [dashboardData, setDashboardData] = useState<SmartDashboardData>({
    saldoTotal: 0,
    saldoInicial: 0,
    saldoMovimentacoes: 0,
    rendaMes: 0,
    gastosMes: 0,
    saldoEsperado: 0,
    saudeFinanceira: { score: 0, status: 'critico', tendencia: 'estavel' },
    proximosCompromissos: [],
    insights: [],
    conquistas: [],
    projecaoTrimestre: [],
    categoriasMaisGastas: [],
    padraoGastos: {
      diaMaisGasto: '',
      hoarioMaisGasto: '',
      estabelecimentoFavorito: ''
    },
    isLoading: true
  });

  // Obter saldo inicial do mês atual
  const orcamentoAtual = getOrcamentoAtual();
  const saldoInicial = orcamentoAtual?.saldo_inicial || 0;
  
  // Usar hook de saldo esperado
  const saldoEsperado = useSaldoEsperado(saldoInicial);

  // Calculadora de saúde financeira
  const calcularSaudeFinanceira = (
    saldoAtual: number,
    rendaMes: number,
    gastosMes: number,
    metaEconomia: number
  ): FinancialHealth => {
    let score = 50; // Base
    
    // Saldo positivo (+20 pontos)
    if (saldoAtual > 0) score += 20;
    else if (saldoAtual < 0) score -= 30;
    
    // Taxa de poupança (+30 pontos máx)
    if (rendaMes > 0) {
      const taxaPoupanca = ((rendaMes - gastosMes) / rendaMes) * 100;
      if (taxaPoupanca >= 20) score += 30;
      else if (taxaPoupanca >= 10) score += 20;
      else if (taxaPoupanca >= 5) score += 10;
      else if (taxaPoupanca < 0) score -= 20;
    }
    
    // Meta de economia (até +20 pontos)
    if (metaEconomia > 0 && saldoAtual >= metaEconomia) {
      score += 20;
    } else if (metaEconomia > 0 && saldoAtual >= metaEconomia * 0.8) {
      score += 10;
    }
    
    // Normalizar score (0-100)
    score = Math.max(0, Math.min(100, score));
    
    let status: FinancialHealth['status'] = 'critico';
    if (score >= 80) status = 'excelente';
    else if (score >= 60) status = 'bom';
    else if (score >= 40) status = 'atencao';
    
    return {
      score,
      status,
      tendencia: 'estavel' // TODO: calcular baseado nos últimos meses
    };
  };

  // Gerador de insights inteligentes
  const gerarInsights = (data: Partial<SmartDashboardData>): SmartInsight[] => {
    const insights: SmartInsight[] = [];
    
    // Insight crítico: Saldo negativo
    if (data.saldoTotal && data.saldoTotal < 0) {
      insights.push({
        id: 'saldo-negativo',
        tipo: 'critico',
        titulo: '⚠️ Saldo Negativo Detectado',
        mensagem: `Seu saldo atual está R$ ${Math.abs(data.saldoTotal).toFixed(2)} negativo. É importante revisar seus gastos urgentemente.`,
        impacto: 'Alto - Pode gerar juros e taxas',
        acao: 'Revisar gastos e buscar receitas extras',
        confianca: 'alta'
      });
    }
    
    // Insight de sucesso: Meta alcançada
    if (data.saudeFinanceira && data.saudeFinanceira.score >= 80) {
      insights.push({
        id: 'meta-alcancada',
        tipo: 'sucesso',
        titulo: '🎉 Excelente Controle Financeiro!',
        mensagem: `Parabéns! Sua saúde financeira está em ${data.saudeFinanceira.score}%. Continue assim!`,
        impacto: 'Positivo - Estabilidade garantida',
        acao: 'Considere investir o excedente',
        confianca: 'alta'
      });
    }
    
    // Insight comportamental: Categoria de maior gasto
    if (data.categoriasMaisGastas && data.categoriasMaisGastas.length > 0) {
      const maiorGasto = data.categoriasMaisGastas[0];
      if (maiorGasto.percentual > 30) {
        insights.push({
          id: 'categoria-concentrada',
          tipo: 'alerta',
          titulo: '📊 Concentração de Gastos',
          mensagem: `${maiorGasto.percentual.toFixed(1)}% dos seus gastos são em "${maiorGasto.categoria}". Considere diversificar ou otimizar esta categoria.`,
          impacto: 'Médio - Risco de descontrole',
          acao: 'Revisar gastos nesta categoria',
          confianca: 'alta'
        });
      }
    }
    
    // Insight de projeção
    if (data.rendaMes && data.gastosMes && data.rendaMes > 0) {
      const projecaoMes = data.rendaMes - data.gastosMes;
      if (projecaoMes > 0) {
        const mesesParaUmSalario = data.rendaMes / projecaoMes;
        if (mesesParaUmSalario <= 12) {
          insights.push({
            id: 'reserva-emergencia',
            tipo: 'info',
            titulo: '💰 Construindo Reserva',
            mensagem: `No ritmo atual, você acumulará o equivalente a 1 mês de renda em ${Math.ceil(mesesParaUmSalario)} meses. Ótimo progresso!`,
            impacto: 'Positivo - Segurança financeira',
            acao: 'Manter disciplina nos gastos',
            confianca: 'media'
          });
        }
      }
    }
    
    return insights.slice(0, 4); // Máximo 4 insights
  };

  // Calculadora de próximos compromissos
  const calcularProximosCompromissos = (): NextCommitment[] => {
    const compromissos: NextCommitment[] = [];
    const hoje = new Date();
    
    // TODO: Implementar lógica para buscar próximos gastos fixos e parcelas
    // Por enquanto, retornamos array vazio
    
    return compromissos.slice(0, 5); // Máximo 5 compromissos
  };

  // Calculadora de conquistas
  const calcularConquistas = (
    saldoAtual: number,
    rendaMes: number,
    gastosMes: number,
    metaEconomia: number
  ): Achievement[] => {
    const conquistas: Achievement[] = [];
    
    // Conquista: Meta de economia mensal
    if (metaEconomia > 0) {
      const progressoMeta = Math.min((saldoAtual / metaEconomia) * 100, 100);
      conquistas.push({
        id: 'meta-economia',
        titulo: 'Meta de Economia Mensal',
        descricao: `Economizar R$ ${metaEconomia.toFixed(2)} este mês`,
        progresso: Math.max(0, progressoMeta),
        meta: metaEconomia,
        atual: Math.max(0, saldoAtual),
        icone: '🎯',
        concluido: progressoMeta >= 100
      });
    }
    
    // Conquista: Controle de gastos
    if (rendaMes > 0) {
      const taxaGasto = (gastosMes / rendaMes) * 100;
      const progressoControle = Math.max(0, 100 - taxaGasto);
      conquistas.push({
        id: 'controle-gastos',
        titulo: 'Controle de Gastos',
        descricao: 'Manter gastos abaixo de 80% da renda',
        progresso: Math.min(progressoControle, 100),
        meta: rendaMes * 0.8,
        atual: gastosMes,
        icone: '🎯',
        concluido: taxaGasto <= 80
      });
    }
    
    return conquistas;
  };

  // Efeito principal para calcular todos os dados
  useEffect(() => {
    const calcularDashboard = async () => {
      if (!user || movLoading) {
        return;
      }

      try {
        setDashboardData(prev => ({ ...prev, isLoading: true, error: undefined }));

        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        
        // Calcular movimentações do mês
        const entradasMes = entradas.filter(entrada => 
          new Date(entrada.data) >= inicioMes && entrada.categoria !== 'Saldo Inicial'
        ).reduce((total, entrada) => total + entrada.valor, 0);
        
        const saidasMes = saidas.filter(saida => 
          new Date(saida.data) >= inicioMes && saida.categoria !== 'Saldo Inicial'
        ).reduce((total, saida) => total + saida.valor, 0);

        const saldoMovimentacoes = entradasMes - saidasMes;
        const saldoTotal = saldoInicial + saldoMovimentacoes;

        // Buscar meta de economia do perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('meta_economia_mensal')
          .eq('id', user.id)
          .single();

        const metaEconomia = profile?.meta_economia_mensal || 0;

        // Calcular categorias mais gastas
        const categoriasTotais: { [key: string]: number } = {};
        saidas.forEach(saida => {
          const categoria = saida.categoria || 'Sem categoria';
          categoriasTotais[categoria] = (categoriasTotais[categoria] || 0) + saida.valor;
        });
        
        const totalGastos = Object.values(categoriasTotais).reduce((sum, val) => sum + val, 0);
        const categoriasMaisGastas = Object.entries(categoriasTotais)
          .map(([categoria, valor]) => ({
            categoria,
            valor,
            percentual: totalGastos > 0 ? (valor / totalGastos) * 100 : 0
          }))
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 5);

        // Calcular saúde financeira
        const saudeFinanceira = calcularSaudeFinanceira(saldoTotal, entradasMes, saidasMes, metaEconomia);

        // Dados consolidados
        const novosDados: SmartDashboardData = {
          saldoTotal,
          saldoInicial,
          saldoMovimentacoes,
          rendaMes: entradasMes,
          gastosMes: saidasMes,
          saldoEsperado: saldoEsperado.saldoProjetado,
          saudeFinanceira,
          proximosCompromissos: calcularProximosCompromissos(),
          insights: [],
          conquistas: calcularConquistas(saldoTotal, entradasMes, saidasMes, metaEconomia),
          projecaoTrimestre: [],
          categoriasMaisGastas,
          padraoGastos: {
            diaMaisGasto: 'Sexta-feira', // TODO: Calcular baseado nos dados reais
            hoarioMaisGasto: '18h-20h',
            estabelecimentoFavorito: 'Supermercado'
          },
          isLoading: false
        };

        // Gerar insights com os dados calculados
        novosDados.insights = gerarInsights(novosDados);

        setDashboardData(novosDados);
        
        // Cache por 5 minutos
        const cacheKey = `smart_dashboard_${user.id}`;
        setCache(cacheKey, novosDados, 5 * 60 * 1000);
        
      } catch (error) {
        console.error('Erro ao calcular dashboard:', error);
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erro ao carregar dados do dashboard'
        }));
      }
    };

    calcularDashboard();
  }, [
    user,
    movimentacoes,
    entradas,
    saidas,
    saldoInicial,
    saldoEsperado,
    movLoading,
    setCache
  ]);

  return dashboardData;
};