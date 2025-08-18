import { useState } from "react";
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
import { PatrimonialAnalysisCard } from "@/components/relatorios/PatrimonialAnalysisCard";
import { PredictabilityAnalysisCard } from "@/components/relatorios/PredictabilityAnalysisCard";
import { useAdvancedReportsData } from "@/hooks/useAdvancedReportsData";

import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/export-utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Filter,
  Download,
  Activity,
  PieChart,
  Brain,
  Wallet
} from "lucide-react";
import { useMemo } from "react";

export const Relatorios = () => {
  const data = useAdvancedReportsData();
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState<'pdf' | null>(null);
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  // Get available categories and payment methods for filters
  const { availableCategories, availablePaymentMethods } = useMemo(() => {
    return {
      availableCategories: [] as string[],
      availablePaymentMethods: [] as string[]
    };
  }, []);

  const tabs = [
    { id: "visao-geral", label: "Geral", icon: Activity },
    { id: "categorias", label: "Categorias", icon: PieChart },
    { id: "comportamento", label: "Análise", icon: Brain },
    { id: "projetos", label: "Futuro", icon: Target }
  ];

  // Export functionality
  const handleExportPDF = async () => {
    if (data.isLoading) {
      toast({
        title: "Aguarde o carregamento",
        description: "Os dados ainda estão sendo carregados.",
        variant: "destructive",
      });
      return;
    }

    setExportLoading('pdf');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const exportData = {
        reportData: data,
        filteredTransactions: []
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
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex flex-col gap-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 sm:pt-6">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Análise detalhada das suas finanças
          </p>
        </div>
        
        {/* Mobile Actions */}
        <div className="flex gap-2 sm:gap-3">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Filtros e Configurações</h2>
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
          
          <Button 
            onClick={handleExportPDF} 
            disabled={exportLoading === 'pdf'}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            {exportLoading === 'pdf' ? (
              <div className="animate-spin h-4 w-4 mr-2 border border-current border-t-transparent rounded-full" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {/* Mobile-First Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative">
          <TabsList className="grid w-full grid-cols-4 h-12 sm:h-10 text-xs sm:text-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-1.5 sm:p-2"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="leading-none">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="mt-4 space-y-4">
          <TabsContent value="visao-geral" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <AdvancedKPICards kpis={data.kpis} isLoading={data.isLoading} />
              <PatrimonialAnalysisCard data={data.patrimonialAnalysis} isLoading={data.isLoading} />
              <TemporalAnalysisCharts data={data.temporalAnalysis} isLoading={data.isLoading} />
            </motion.div>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <CategoryAnalysisCharts data={data.categoryAnalysis} isLoading={data.isLoading} />
              
              {/* Payment Methods - Mobile Optimized */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wallet className="h-5 w-5" />
                    Métodos de Pagamento
                  </CardTitle>
                  <CardDescription>
                    Distribuição por forma de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.paymentMethodAnalysis.map((method, index) => (
                      <div 
                        key={method.method}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }}
                          />
                          <div>
                            <p className="font-medium text-sm">{method.method}</p>
                            <p className="text-xs text-muted-foreground">
                              {method.transactionCount} transações
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(method.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {method.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="comportamento" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <BehavioralAnalysisCharts data={data.behavioralInsights} isLoading={data.isLoading} />
              <SmartInsightsPanel insights={data.smartInsights} isLoading={data.isLoading} />
              <PredictabilityAnalysisCard data={data.predictabilityAnalysis} isLoading={data.isLoading} />
            </motion.div>
          </TabsContent>

          <TabsContent value="projetos" className="space-y-4 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Financial Projections - Mobile First */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Projeções Financeiras
                  </CardTitle>
                  <CardDescription>
                    Cenários futuros baseados no histórico atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium">Próximo Mês</span>
                      </div>
                      <div className="pl-5 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Receitas: {formatCurrency(data.projections.nextMonth.income)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Despesas: {formatCurrency(data.projections.nextMonth.expenses)}
                        </p>
                        <p className="text-sm font-semibold">
                          Saldo: {formatCurrency(data.projections.nextMonth.balance)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium">3 Meses</span>
                      </div>
                      <div className="pl-5 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Receitas: {formatCurrency(data.projections.next3Months.income)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Despesas: {formatCurrency(data.projections.next3Months.expenses)}
                        </p>
                        <p className="text-sm font-semibold">
                          Saldo: {formatCurrency(data.projections.next3Months.balance)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span className="text-sm font-medium">6 Meses</span>
                      </div>
                      <div className="pl-5 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Receitas: {formatCurrency(data.projections.next6Months.income)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Despesas: {formatCurrency(data.projections.next6Months.expenses)}
                        </p>
                        <p className="text-sm font-semibold">
                          Saldo: {formatCurrency(data.projections.next6Months.balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scenarios */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-4">Cenários de Crescimento</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: "Otimista", value: data.projections.scenarios.optimistic, color: "bg-green-100 text-green-800" },
                        { name: "Realista", value: data.projections.scenarios.realistic, color: "bg-blue-100 text-blue-800" },
                        { name: "Pessimista", value: data.projections.scenarios.pessimistic, color: "bg-orange-100 text-orange-800" }
                      ].map((scenario) => (
                        <div key={scenario.name} className="text-center">
                          <Badge variant="outline" className={scenario.color}>
                            {scenario.name}
                          </Badge>
                          <p className="mt-2 font-semibold">
                            {formatCurrency(scenario.value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};