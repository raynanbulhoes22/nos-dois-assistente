import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, TrendingUp, TrendingDown, AlertTriangle, 
  DollarSign, CreditCard, Target, ChevronLeft, ChevronRight 
} from "lucide-react";
import { usePrevisibilidadeFinanceira } from "@/hooks/usePrevisibilidadeFinanceira";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useGastosFixos } from "@/hooks/useGastosFixos";
import { useContasParceladas } from "@/hooks/useContasParceladas";

export const MonthlyProjections = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { previsoes, alertas } = usePrevisibilidadeFinanceira();
  const { getTotalRendaAtiva } = useFontesRenda();
  const { getTotalGastosFixosAtivos } = useGastosFixos();
  const { getTotalParcelasAtivas, calcularParcelasProjetadas } = useContasParceladas();

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  const navegarMes = (direction: 'anterior' | 'proximo') => {
    if (direction === 'anterior') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Calcular projeções para o mês selecionado
  const rendaProjetada = getTotalRendaAtiva();
  const gastosFixosProjetados = getTotalGastosFixosAtivos();
  const parcelasProjetadas = getTotalParcelasAtivas();
  const totalGastosProjetados = gastosFixosProjetados + parcelasProjetadas;
  const saldoProjetado = rendaProjetada - totalGastosProjetados;

  // Próximos 6 meses
  const proximosMeses = [];
  for (let i = 0; i < 6; i++) {
    const mes = ((selectedMonth + i - 1) % 12) + 1;
    const ano = selectedYear + Math.floor((selectedMonth + i - 1) / 12);
    const parcelas = getTotalParcelasAtivas();
    const totalGastos = gastosFixosProjetados + parcelas;
    const saldo = rendaProjetada - totalGastos;

    proximosMeses.push({
      mes,
      ano,
      nome: getMesNome(mes),
      rendaProjetada,
      gastosProjetados: totalGastos,
      saldoProjetado: saldo,
      status: saldo >= 0 ? 'positivo' : 'negativo'
    });
  }

  const alertasCriticos = alertas.filter(a => a.prioridade === 'alta');
  const alertasAtencao = alertas.filter(a => a.prioridade === 'media');

  return (
    <div className="space-y-4">
      {/* Header com navegação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Projeções Mensais
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes('anterior')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-24 text-center">
                {getMesNome(selectedMonth)} {selectedYear}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes('proximo')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Renda Projetada</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(rendaProjetada)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <CreditCard className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Gastos Projetados</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(totalGastosProjetados)}
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${saldoProjetado >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
              <Target className="h-8 w-8 mx-auto mb-2" style={{ 
                color: saldoProjetado >= 0 ? '#2563eb' : '#d97706' 
              }} />
              <p className="text-sm text-muted-foreground">Saldo Projetado</p>
              <p className={`text-xl font-bold ${saldoProjetado >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                {formatCurrency(saldoProjetado)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projections">Próximos Meses</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhamento {getMesNome(selectedMonth)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gastos Fixos:</span>
                  <span className="font-medium">{formatCurrency(gastosFixosProjetados)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Parcelas/Financiamentos:</span>
                  <span className="font-medium">{formatCurrency(parcelasProjetadas)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total de Gastos:</span>
                  <span>{formatCurrency(totalGastosProjetados)}</span>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  <span>Margem Disponível:</span>
                  <span className={`${saldoProjetado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(saldoProjetado)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">% da Renda Comprometida:</span>
                  <Badge variant={
                    (totalGastosProjetados / rendaProjetada) * 100 > 80 ? "destructive" :
                    (totalGastosProjetados / rendaProjetada) * 100 > 60 ? "secondary" : "default"
                  }>
                    {((totalGastosProjetados / rendaProjetada) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proximosMeses.map((mes, index) => (
              <Card key={index} className={`${
                mes.status === 'negativo' ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">
                      {mes.nome} {mes.ano}
                    </h4>
                    {mes.status === 'negativo' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renda:</span>
                      <span>{formatCurrency(mes.rendaProjetada)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gastos:</span>
                      <span>{formatCurrency(mes.gastosProjetados)}</span>
                    </div>
                    <hr className="my-1" />
                    <div className="flex justify-between font-medium">
                      <span>Saldo:</span>
                      <span className={mes.status === 'negativo' ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(mes.saldoProjetado)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alertasCriticos.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-base text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alertasCriticos.map((alerta, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{alerta.descricao}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {alertasAtencao.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="text-base text-yellow-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Requer Atenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alertasAtencao.map((alerta, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{alerta.descricao}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {alertas.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-700 mb-2">Tudo em dia!</p>
                <p className="text-sm text-muted-foreground">
                  Não há alertas financeiros no momento.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};