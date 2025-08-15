import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ReportsFilters } from "@/components/relatorios/ReportsFilters";
import { AdvancedKPICards } from "@/components/relatorios/AdvancedKPICards";
import { SmartInsightsPanel } from "@/components/relatorios/SmartInsightsPanel";
import { TemporalAnalysisCharts } from "@/components/relatorios/TemporalAnalysisCharts";
import { CategoryAnalysisCharts } from "@/components/relatorios/CategoryAnalysisCharts";
import { BehavioralAnalysisCharts } from "@/components/relatorios/BehavioralAnalysisCharts";
import { useAdvancedReportsData } from "@/hooks/useAdvancedReportsData";

import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/export-utils";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Wallet
} from "lucide-react";
import { useMemo } from "react";

export const Relatorios = () => {
  const data = useAdvancedReportsData();
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState<'pdf' | null>(null);
  const [activeTab, setActiveTab] = useState("visao-geral");
  const isMobile = useIsMobile();

  // Get available categories and payment methods for filters
  const { availableCategories, availablePaymentMethods } = useMemo(() => {
    return {
      availableCategories: [] as string[],
      availablePaymentMethods: [] as string[]
    };
  }, []);

  // Use the transaction count from useAdvancedReportsData's KPIs as indicator
  const hasTransactions = useMemo(() => {
    const transactionCount = data.kpis?.transactionCount || 0;
    console.log('Debug: === VERIFICANDO TRANSAÇÕES ===');
    console.log('Debug: data.isLoading:', data.isLoading);
    console.log('Debug: KPI transaction count:', transactionCount);
    console.log('Debug: data.kpis exists:', !!data.kpis);
    console.log('Debug: categoryAnalysis length:', data.categoryAnalysis?.length || 0);
    
    // Se temos dados nos KPIs, assumimos que há transações
    return transactionCount > 0;
  }, [data]);

  console.log('Debug: === RESULTADO FINAL ===');
  console.log('Debug: hasTransactions:', hasTransactions);
  console.log('Debug: Data loading:', data.isLoading);

  // Export functionality
  const handleExportPDF = async () => {
    // Verificações mais rigorosas para PDF
    if (data.isLoading) {
      toast({
        title: "Aguarde o carregamento",
        description: "Os dados ainda estão sendo carregados. Aguarde um momento.",
        variant: "destructive",
      });
      return;
    }

    if (!data.kpis || !data.categoryAnalysis || data.categoryAnalysis.length === 0) {
      toast({
        title: "Nenhum dado disponível",
        description: "Aguarde o carregamento dos dados ou aplique filtros válidos.",
        variant: "destructive",
      });
      return;
    }

    if (!hasTransactions) {
      toast({
        title: "Nenhuma transação encontrada",
        description: "Não há dados suficientes para gerar o relatório PDF.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o elemento existe e está renderizado
    const reportElement = document.getElementById('relatorios-content');
    if (!reportElement) {
      toast({
        title: "Erro de renderização",
        description: "O relatório não está pronto para exportação. Recarregue a página.",
        variant: "destructive",
      });
      return;
    }

    setExportLoading('pdf');
    try {
      // Aguardar um momento para garantir que tudo está renderizado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const exportData = {
        reportData: data,
        filteredTransactions: [] // Usar array vazio já que os dados estão nos KPIs
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

  if (data.isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-40 bg-muted animate-pulse rounded" />
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {Array.from({ length: isMobile ? 4 : 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="container mx-auto p-4">
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

  // Mobile Quick Actions
  const MobileQuickActions = () => (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full h-12">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh]">
          <div className="py-4">
            <h3 className="font-semibold mb-4">Filtros de Relatório</h3>
            <ReportsFilters
              filters={data.filters}
              onFiltersChange={data.setFilters}
              availableCategories={availableCategories}
              availablePaymentMethods={availablePaymentMethods}
              onExportPDF={handleExportPDF}
              exportLoading={exportLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full h-12">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <div className="py-4 space-y-3">
            <h3 className="font-semibold mb-4">Exportar Relatório</h3>
            <Button 
              onClick={handleExportPDF}
              disabled={exportLoading === 'pdf'}
              className="w-full h-12"
              variant="outline"
            >
              {exportLoading === 'pdf' ? 'Gerando PDF...' : 'Exportar PDF'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  // Mobile Tabs Configuration
  const mobileTabs = [
    { id: "visao-geral", label: "Geral", icon: BarChart3 },
    { id: "categorias", label: "Categorias", icon: PieChart },
    { id: "comportamento", label: "Padrões", icon: Activity },
    { id: "insights", label: "Insights", icon: Brain },
    { id: "projecoes", label: "Futuro", icon: Target }
  ];

  return (
    <div className={`${isMobile ? 'p-4' : 'container mx-auto p-6'}`}>
      <div className="flex flex-col gap-6 bg-background" id="relatorios-content" data-export="relatorios">
        {/* Header */}
        <div className="text-center">
          <motion.h1 
            className={`font-bold tracking-tight text-foreground mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Relatórios Financeiros
          </motion.h1>
          <motion.p 
            className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Análise completa dos seus dados financeiros
          </motion.p>
        </div>

        {isMobile ? (
          <>
            {/* Mobile Quick Actions */}
            <MobileQuickActions />

            {/* Mobile Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                {mobileTabs.slice(0, 3).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex flex-col gap-1 py-3 text-xs"
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Secondary tabs for remaining items */}
              <div className="flex gap-2 mt-2">
                {mobileTabs.slice(3).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className="flex-1"
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>

              <TabsContent value="visao-geral" className="space-y-6 mt-6">
                <AdvancedKPICards kpis={data.kpis} isLoading={data.isLoading} />
                <TemporalAnalysisCharts data={data.temporalAnalysis} isLoading={data.isLoading} />
              </TabsContent>

              <TabsContent value="categorias" className="space-y-6 mt-6">
                <CategoryAnalysisCharts data={data.categoryAnalysis} isLoading={data.isLoading} />
                
                {/* Payment Methods - Mobile Optimized */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wallet className="h-5 w-5" />
                      Formas de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.paymentMethodAnalysis.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Nenhuma forma de pagamento identificada</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.paymentMethodAnalysis.slice(0, 5).map((method, index) => (
                          <div key={method.method} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                                  {index + 1}
                                </Badge>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate">{method.method}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {method.transactionCount} transações
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-sm">{formatCurrency(method.amount)}</div>
                                <div className="text-xs text-muted-foreground">
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
              </TabsContent>

              <TabsContent value="comportamento" className="space-y-6 mt-6">
                <BehavioralAnalysisCharts data={data.behavioralInsights} isLoading={data.isLoading} />
              </TabsContent>

              <TabsContent value="insights" className="space-y-6 mt-6">
                <SmartInsightsPanel insights={data.smartInsights} isLoading={data.isLoading} />
              </TabsContent>

              <TabsContent value="projecoes" className="space-y-6 mt-6">
                {/* Mobile Projections */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5" />
                      Projeções Financeiras
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Next Month */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm border-b pb-2">Próximo Mês</h4>
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

                      {/* 3 Months */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm border-b pb-2">Próximos 3 Meses</h4>
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

                      {/* Scenarios */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm border-b pb-2">Cenários</h4>
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
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            {/* Desktop Layout */}
            <ReportsFilters
              filters={data.filters}
              onFiltersChange={data.setFilters}
              availableCategories={availableCategories}
              availablePaymentMethods={availablePaymentMethods}
              onExportPDF={handleExportPDF}
              exportLoading={exportLoading}
            />

            <AdvancedKPICards kpis={data.kpis} isLoading={data.isLoading} />
            <SmartInsightsPanel insights={data.smartInsights} isLoading={data.isLoading} />

            {/* Financial Projections - Desktop */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Projeções Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Próximo Mês</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Receitas previstas:</span>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(data.projections.nextMonth.income)}
                        </span>
                      </div>
                      <div className="flex justify-between">
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

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Próximos 3 Meses</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Receitas previstas:</span>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(data.projections.next3Months.income)}
                        </span>
                      </div>
                      <div className="flex justify-between">
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

            <TemporalAnalysisCharts data={data.temporalAnalysis} isLoading={data.isLoading} />
            <CategoryAnalysisCharts data={data.categoryAnalysis} isLoading={data.isLoading} />
            <BehavioralAnalysisCharts data={data.behavioralInsights} isLoading={data.isLoading} />

            {/* Payment Method Analysis - Desktop */}
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
          </>
        )}

        {/* Summary Footer */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>
                Relatório gerado baseado em {data.kpis.transactionCount} transações 
                de {data.filters.startDate.toLocaleDateString('pt-BR')} até {data.filters.endDate.toLocaleDateString('pt-BR')}
              </p>
              <p>
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