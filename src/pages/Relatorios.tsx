import { useAdvancedReportsData } from "@/hooks/useAdvancedReportsData";
import { ReportsFilters } from "@/components/relatorios/ReportsFilters";
import { AdvancedKPICards } from "@/components/relatorios/AdvancedKPICards";
import { TemporalAnalysisCharts } from "@/components/relatorios/TemporalAnalysisCharts";
import { CategoryAnalysisCharts } from "@/components/relatorios/CategoryAnalysisCharts";
import { SmartInsightsPanel } from "@/components/relatorios/SmartInsightsPanel";
import { BehavioralAnalysisCharts } from "@/components/relatorios/BehavioralAnalysisCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useMemo } from "react";

export const Relatorios = () => {
  const { movimentacoes } = useMovimentacoes();
  const reportsData = useAdvancedReportsData();

  // Get available categories and payment methods for filters
  const { availableCategories, availablePaymentMethods } = useMemo(() => {
    const categories = [...new Set(movimentacoes.map(mov => mov.categoria))].filter(Boolean).sort();
    const paymentMethods = [...new Set(movimentacoes.map(mov => mov.forma_pagamento))].filter(Boolean).sort();
    
    return {
      availableCategories: categories,
      availablePaymentMethods: paymentMethods
    };
  }, [movimentacoes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting PDF...');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting Excel...');
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log('Exporting CSV...');
  };

  if (reportsData.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-40 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reportsData.error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">Erro ao carregar relatórios: {reportsData.error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Detalhados</h1>
          <p className="text-muted-foreground mt-2">
            Análise completa da sua situação financeira com insights avançados
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <ReportsFilters
        filters={reportsData.filters}
        onFiltersChange={reportsData.setFilters}
        availableCategories={availableCategories}
        availablePaymentMethods={availablePaymentMethods}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
      />

      {/* KPIs Overview */}
      <AdvancedKPICards 
        kpis={reportsData.kpis} 
        isLoading={reportsData.isLoading}
      />

      {/* Smart Insights */}
      <SmartInsightsPanel 
        insights={reportsData.smartInsights} 
        isLoading={reportsData.isLoading}
      />

      {/* Financial Projections */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Projeções Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Próximo Mês</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Receitas previstas:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(reportsData.projections.nextMonth.income)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gastos previstos:</span>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(reportsData.projections.nextMonth.expenses)}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Saldo projetado:</span>
                  <span className={reportsData.projections.nextMonth.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(reportsData.projections.nextMonth.balance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Próximos 3 Meses</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Receitas previstas:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(reportsData.projections.next3Months.income)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gastos previstos:</span>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(reportsData.projections.next3Months.expenses)}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Saldo projetado:</span>
                  <span className={reportsData.projections.next3Months.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(reportsData.projections.next3Months.balance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Cenários de Saldo Mensal</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Otimista:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(reportsData.projections.scenarios.optimistic)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Realista:</span>
                  <span className="font-medium">
                    {formatCurrency(reportsData.projections.scenarios.realistic)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pessimista:</span>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(reportsData.projections.scenarios.pessimistic)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temporal Analysis */}
      <TemporalAnalysisCharts 
        data={reportsData.temporalAnalysis} 
        isLoading={reportsData.isLoading}
      />

      {/* Category Analysis */}
      <CategoryAnalysisCharts 
        data={reportsData.categoryAnalysis} 
        isLoading={reportsData.isLoading}
      />

      {/* Behavioral Analysis */}
      <BehavioralAnalysisCharts 
        data={reportsData.behavioralInsights} 
        isLoading={reportsData.isLoading}
      />

      {/* Payment Method Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Análise por Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportsData.paymentMethodAnalysis.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma forma de pagamento identificada no período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportsData.paymentMethodAnalysis.map((method, index) => (
                <div key={method.method} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{method.method}</div>
                        <div className="text-sm text-muted-foreground">
                          {method.transactionCount} transações • Ticket médio: {formatCurrency(method.avgAmount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Categorias: {method.categories.slice(0, 3).join(', ')}
                          {method.categories.length > 3 && ` +${method.categories.length - 3}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(method.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Progress value={method.percentage} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Relatório gerado automaticamente baseado em {reportsData.kpis.transactionCount} transações 
              de {reportsData.filters.startDate.toLocaleDateString('pt-BR')} até {reportsData.filters.endDate.toLocaleDateString('pt-BR')}
            </p>
            <p className="mt-2">
              Score de Saúde Financeira: {reportsData.kpis.financialHealthScore.toFixed(0)}/100 • 
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};