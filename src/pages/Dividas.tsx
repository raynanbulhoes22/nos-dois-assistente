import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Divida {
  id: string;
  nome: string;
  valor_total: number;
  parcelas: number;
  parcelas_pagas: number;
  juros: number;
  estrategia?: string;
  data_inicio: string;
}

export const Dividas = () => {
  const { user } = useAuth();
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDividas = async () => {
    if (!user) return;
    
    try {
      // Por enquanto, vamos simular dados até que as tabelas sejam criadas
      const mockData: Divida[] = [
        {
          id: '1',
          nome: 'Cartão de Crédito',
          valor_total: 2000,
          parcelas: 12,
          parcelas_pagas: 3,
          juros: 3.5,
          estrategia: 'avalanche',
          data_inicio: '2024-01-01'
        }
      ];
      setDividas(mockData);
    } catch (error) {
      console.error('Erro ao buscar dívidas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDividas();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularValorRestante = (divida: Divida) => {
    const valorParcela = divida.valor_total / divida.parcelas;
    const parcelasRestantes = divida.parcelas - divida.parcelas_pagas;
    return valorParcela * parcelasRestantes;
  };

  const calcularProgresso = (divida: Divida) => {
    return (divida.parcelas_pagas / divida.parcelas) * 100;
  };

  const totalDividas = dividas.reduce((total, divida) => total + calcularValorRestante(divida), 0);
  const totalPago = dividas.reduce((total, divida) => {
    const valorParcela = divida.valor_total / divida.parcelas;
    return total + (valorParcela * divida.parcelas_pagas);
  }, 0);

  const dividasBolaDeNeve = [...dividas].sort((a, b) => calcularValorRestante(a) - calcularValorRestante(b));
  const dividasAvalanche = [...dividas].sort((a, b) => b.juros - a.juros);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Carregando dívidas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dívidas</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Dívida
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDividas)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dívidas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dividas.filter(d => d.parcelas_pagas < d.parcelas).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Estratégia Bola de Neve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Pague primeiro as menores dívidas para ganhar momentum
            </p>
            <div className="space-y-2">
              {dividasBolaDeNeve.slice(0, 3).map((divida, index) => (
                <div key={divida.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{divida.nome}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(calcularValorRestante(divida))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estratégia Avalanche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Pague primeiro as dívidas com maiores juros para economizar
            </p>
            <div className="space-y-2">
              {dividasAvalanche.slice(0, 3).map((divida, index) => (
                <div key={divida.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{divida.nome}</span>
                  </div>
                  <span className="text-sm font-medium">{divida.juros}% a.m.</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Dívidas</CardTitle>
        </CardHeader>
        <CardContent>
          {dividas.length > 0 ? (
            <div className="space-y-4">
              {dividas.map((divida) => {
                const valorRestante = calcularValorRestante(divida);
                const progresso = calcularProgresso(divida);
                const valorParcela = divida.valor_total / divida.parcelas;
                const isQuitada = divida.parcelas_pagas >= divida.parcelas;

                return (
                  <div key={divida.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{divida.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {divida.parcelas_pagas}/{divida.parcelas} parcelas pagas
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={isQuitada ? "default" : "destructive"}>
                          {isQuitada ? "Quitada" : "Em andamento"}
                        </Badge>
                        {divida.juros > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {divida.juros}% a.m.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{progresso.toFixed(1)}%</span>
                      </div>
                      <Progress value={progresso} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="font-medium">{formatCurrency(divida.valor_total)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor da Parcela</p>
                        <p className="font-medium">{formatCurrency(valorParcela)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Restante</p>
                        <p className="font-medium text-red-600">
                          {formatCurrency(valorRestante)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma dívida encontrada. Parabéns! 🎉
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};