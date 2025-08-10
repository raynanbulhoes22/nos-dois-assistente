import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  CreditCard, 
  Activity,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Import components
import { InteractiveCharts } from "./InteractiveCharts";
import { CategoryAnalysisCard } from "./CategoryAnalysisCard";
import { PaymentMethodAnalysisCard } from "./PaymentMethodAnalysisCard";
import { BehaviorAnalysisCard } from "./BehaviorAnalysisCard";
import { QuickInsights } from "./QuickInsights";

interface MobileOptimizedTabsProps {
  user: { id: string; email?: string };
  chartData: any;
  currentMonthMovs: any[];
  isLoading?: boolean;
}

export const MobileOptimizedTabs = ({
  user,
  chartData,
  currentMonthMovs,
  isLoading
}: MobileOptimizedTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      id: "overview",
      label: "Visão Geral",
      icon: <BarChart3 className="h-4 w-4" />,
      badge: null
    },
    {
      id: "analyses",
      label: "Análises",
      icon: <TrendingUp className="h-4 w-4" />,
      badge: "3"
    },
    {
      id: "transactions",
      label: "Transações",
      icon: <Activity className="h-4 w-4" />,
      badge: currentMonthMovs.length.toString()
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <CreditCard className="h-4 w-4" />,
      badge: null
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile-optimized tab navigation */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <ScrollArea className="w-full">
            <TabsList className="flex w-full h-auto p-1 bg-muted/50">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-[10px]">
                    {tab.label.split(' ')[0]}
                  </span>
                  {tab.badge && (
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-1 py-0 h-4 min-w-4"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          <TabsContent value="overview" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InteractiveCharts 
                data={chartData}
                isLoading={isLoading}
              />
              <QuickInsights
                recentTransactions={currentMonthMovs.slice(0, 5)}
                upcomingCommitments={[]}
                insights={[]}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="analyses" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <CategoryAnalysisCard />
              <PaymentMethodAnalysisCard />
              <BehaviorAnalysisCard />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <div className="space-y-4">
              {/* Transaction navigation */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transações Recentes</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentMonthMovs.length} transações
                  </span>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Transactions list */}
              <div className="space-y-3">
                {currentMonthMovs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <h4 className="font-medium mb-1">Nenhuma transação</h4>
                    <p className="text-sm">Adicione sua primeira transação para começar</p>
                  </div>
                ) : (
                  currentMonthMovs.map((mov) => (
                    <div 
                      key={mov.id} 
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:shadow-md transition-all duration-200 hover:border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          mov.isEntrada ? 'bg-success/10' : 'bg-error/10'
                        }`}>
                          {mov.isEntrada ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <Activity className="h-4 w-4 text-error" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {mov.nome || 'Transação'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{mov.categoria}</span>
                            <span>•</span>
                            <span>{new Date(mov.data).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold ${
                          mov.isEntrada ? 'text-success' : 'text-error'
                        }`}>
                          {mov.isEntrada ? '+' : '-'}{formatCurrency(mov.valor)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações do Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Categorias</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Gerencie suas categorias de gastos
                  </p>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Métodos de Pagamento</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure seus cartões e contas
                  </p>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};