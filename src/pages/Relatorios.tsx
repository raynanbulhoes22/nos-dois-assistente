import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportsFilters } from "@/components/relatorios/ReportsFilters";
import { AdvancedKPICards } from "@/components/relatorios/AdvancedKPICards";
import { SmartInsightsPanel } from "@/components/relatorios/SmartInsightsPanel";
import { TemporalAnalysisCharts } from "@/components/relatorios/TemporalAnalysisCharts";
import { CategoryAnalysisCharts } from "@/components/relatorios/CategoryAnalysisCharts";
import { BehavioralAnalysisCharts } from "@/components/relatorios/BehavioralAnalysisCharts";
import { useAdvancedReportsData } from "@/hooks/useAdvancedReportsData";
import { useMovimentacoesFilters } from "@/hooks/useMovimentacoesFilters";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/export-utils";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { useMemo } from "react";

export const Relatorios = () => {
  const data = useAdvancedReportsData();
  const { baseFilteredMovimentacoes: filteredMovimentacoes } = useMovimentacoesFilters([]);
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | 'csv' | null>(null);

  // Get available categories and payment methods for filters
  const { availableCategories, availablePaymentMethods } = useMemo(() => {
    return {
      availableCategories: [] as string[],
      availablePaymentMethods: [] as string[]
    };
  }, []);

  // Export functionality
  const handleExportPDF = async () => {
    if (!data.kpis || filteredMovimentacoes.length === 0) {
      toast({
        title: "Nenhum dado disponível",
        description: "Aguarde o carregamento dos dados ou aplique filtros válidos.",
        variant: "destructive",
      });
      return;
    }

    setExportLoading('pdf');
    try {
      const exportData = {
        reportData: data,
        filteredTransactions: filteredMovimentacoes
      };
      
      const result = await exportToPDF(exportData, data.filters);
      toast({
        title: "PDF gerado com sucesso!",
        description: `Arquivo ${result.fileName} baixado.`,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportExcel = async () => {
    if (!data.kpis || filteredMovimentacoes.length === 0) {
      toast({
        title: "Nenhum dado disponível",
        description: "Aguarde o carregamento dos dados ou aplique filtros válidos.",
        variant: "destructive",
      });
      return;
    }

    setExportLoading('excel');
    try {
      const exportData = {
        reportData: data,
        filteredTransactions: filteredMovimentacoes
      };
      
      const result = await exportToExcel(exportData, data.filters);
      toast({
        title: "Excel gerado com sucesso!",
        description: `Arquivo ${result.fileName} baixado.`,
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast({
        title: "Erro ao gerar Excel",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportCSV = async () => {
    if (!data.kpis || filteredMovimentacoes.length === 0) {
      toast({
        title: "Nenhum dado disponível",
        description: "Aguarde o carregamento dos dados ou aplique filtros válidos.",
        variant: "destructive",
      });
      return;
    }

    setExportLoading('csv');
    try {
      const exportData = {
        reportData: data,
        filteredTransactions: filteredMovimentacoes
      };
      
      const result = await exportToCSV(exportData, data.filters);
      toast({
        title: "CSV gerado com sucesso!",
        description: `Arquivo ${result.fileName} baixado.`,
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: "Erro ao gerar CSV",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  if (data.isLoading) {
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

  if (data.error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">Erro ao carregar relatórios: {data.error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-8" id="relatorios-content">
        <div className="text-center">
          <motion.h1 
            className="text-3xl font-bold tracking-tight text-foreground mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Relatórios Financeiros
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Análise avançada dos seus dados financeiros
          </motion.p>
        </div>

        {/* Filters Section */}
        <ReportsFilters
          filters={data.filters}
          onFiltersChange={data.setFilters}
          availableCategories={availableCategories}
          availablePaymentMethods={availablePaymentMethods}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onExportCSV={handleExportCSV}
          exportLoading={exportLoading}
        />

        {/* KPIs Overview */}
        <AdvancedKPICards 
          kpis={data.kpis} 
          isLoading={data.isLoading}
        />

        {/* Smart Insights */}
        <SmartInsightsPanel 
          insights={data.smartInsights} 
          isLoading={data.isLoading}
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
                      {formatCurrency(data.projections.nextMonth.income)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gastos previstos:</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(data.projections.nextMonth.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Saldo projetado:</span>
                    <span className={data.projections.nextMonth.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(data.projections.nextMonth.balance)}
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
                      {formatCurrency(data.projections.next3Months.income)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Gastos previstos:</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(data.projections.next3Months.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Saldo projetado:</span>
                    <span className={data.projections.next3Months.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(data.projections.next3Months.balance)}
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
                      {formatCurrency(data.projections.scenarios.optimistic)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Realista:</span>
                    <span className="font-medium">
                      {formatCurrency(data.projections.scenarios.realistic)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pessimista:</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(data.projections.scenarios.pessimistic)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temporal Analysis */}
        <TemporalAnalysisCharts 
          data={data.temporalAnalysis} 
          isLoading={data.isLoading}
        />

        {/* Category Analysis */}
        <CategoryAnalysisCharts 
          data={data.categoryAnalysis} 
          isLoading={data.isLoading}
        />

        {/* Behavioral Analysis */}
        <BehavioralAnalysisCharts 
          data={data.behavioralInsights} 
          isLoading={data.isLoading}
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
            {data.paymentMethodAnalysis.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma forma de pagamento identificada no período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.paymentMethodAnalysis.map((method, index) => (
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
                Relatório gerado automaticamente baseado em {data.kpis.transactionCount} transações 
                de {data.filters.startDate.toLocaleDateString('pt-BR')} até {data.filters.endDate.toLocaleDateString('pt-BR')}
              </p>
              <p className="mt-2">
                Score de Saúde Financeira: {data.kpis.financialHealthScore.toFixed(0)}/100 • 
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};