import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingDown, 
  Calculator, 
  Target,
  Snowflake,
  Flame,
  DollarSign,
  Calendar,
  CreditCard,
  FileText
} from "lucide-react";
import { useContasParceladas } from "@/hooks/useContasParceladas";
// Removemos o hook de cartões da página de dívidas
import { formatCurrency } from "@/lib/utils";
import { DividasOverview } from "@/components/dividas/DividasOverview";
import { EstrategiaQuitacao } from "@/components/dividas/EstrategiaQuitacao";
import { SimuladorAntecipacao } from "@/components/dividas/SimuladorAntecipacao";
import { RankingDividas } from "@/components/dividas/RankingDividas";

export default function Dividas() {
  const [activeTab, setActiveTab] = useState("overview");
  const { contas, isLoading: loadingContas } = useContasParceladas();
  // Removemos o hook de cartões da página de dívidas

  const isLoading = loadingContas;

  // Calcular dados agregados das dívidas (apenas parcelamentos)
  const contasAtivas = contas.filter(conta => conta.ativa);

  const totalDividas = contasAtivas.reduce((total, conta) => {
    const parcelasRestantes = conta.total_parcelas - conta.parcelas_pagas;
    return total + (Number(conta.valor_parcela) * parcelasRestantes);
  }, 0);

  const comprometimentoMensal = contasAtivas.reduce((total, conta) => {
    return total + Number(conta.valor_parcela);
  }, 0);

  const totalDividasAtivas = contasAtivas.length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <TrendingDown className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Dívidas</h1>
          <p className="text-sm text-muted-foreground">
            Estratégias inteligentes para quitar suas dívidas
          </p>
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Total em Dívidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalDividas)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {contasAtivas.length} parcelamentos e financiamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              Comprometimento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {formatCurrency(comprometimentoMensal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor fixo mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Dívidas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {totalDividasAtivas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Parcelamentos e financiamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="estrategias" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Estratégias
          </TabsTrigger>
          <TabsTrigger value="simulador" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Prioridades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DividasOverview 
            contasParceladas={contasAtivas}
            cartoes={[]}
          />
        </TabsContent>

        <TabsContent value="estrategias" className="space-y-4">
          <EstrategiaQuitacao 
            contasParceladas={contasAtivas}
            cartoes={[]}
          />
        </TabsContent>

        <TabsContent value="simulador" className="space-y-4">
          <SimuladorAntecipacao 
            contasParceladas={contasAtivas}
          />
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <RankingDividas 
            contasParceladas={contasAtivas}
            cartoes={[]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}