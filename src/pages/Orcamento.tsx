import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OrcamentoCategoria {
  categoria_nome: string;
  valor_orcado: number;
  valor_gasto: number;
  percentual: number;
}

interface OrcamentoMensal {
  id: string;
  mes: number;
  ano: number;
  saldo_inicial?: number;
  meta_economia?: number;
}

export const Orcamento = () => {
  const { user } = useAuth();
  const [orcamentoAtual, setOrcamentoAtual] = useState<OrcamentoMensal | null>(null);
  const [categorias, setCategorias] = useState<OrcamentoCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const fetchOrcamento = async () => {
    if (!user) return;
    
    try {
      // Por enquanto, vamos simular dados até que as tabelas sejam criadas
      const orcamento: OrcamentoMensal = {
        id: '1',
        mes: mesAtual,
        ano: anoAtual,
        saldo_inicial: 5000,
        meta_economia: 1000
      };

      setOrcamentoAtual(orcamento);

      if (orcamento) {
        // Simular categorias com gastos
        const categoriasComGastos: OrcamentoCategoria[] = [
          {
            categoria_nome: 'Alimentação',
            valor_orcado: 800,
            valor_gasto: 650,
            percentual: 81.25
          },
          {
            categoria_nome: 'Transporte',
            valor_orcado: 400,
            valor_gasto: 450,
            percentual: 112.5
          },
          {
            categoria_nome: 'Lazer',
            valor_orcado: 300,
            valor_gasto: 180,
            percentual: 60
          }
        ];
        setCategorias(categoriasComGastos);
      }
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrcamento();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalOrcado = categorias.reduce((total, cat) => total + cat.valor_orcado, 0);
  const totalGasto = categorias.reduce((total, cat) => total + cat.valor_gasto, 0);
  const percentualGeral = totalOrcado > 0 ? (totalGasto / totalOrcado) * 100 : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Carregando orçamento...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orçamento</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {orcamentoAtual ? "Editar Orçamento" : "Novo Orçamento"}
        </Button>
      </div>

      {!orcamentoAtual ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro orçamento mensal para começar a controlar seus gastos
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Orçamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Inicial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(orcamentoAtual.saldo_inicial || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orçado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalOrcado)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Gasto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalGasto)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Meta de Economia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(orcamentoAtual.meta_economia || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gastos vs Orçamento</span>
                    <span>{percentualGeral.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(percentualGeral, 100)} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(totalGasto)}</span>
                    <span>{formatCurrency(totalOrcado)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categorias.map((categoria) => (
                    <div key={categoria.categoria_nome} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{categoria.categoria_nome}</span>
                        <span className={categoria.percentual > 100 ? "text-red-600" : ""}>
                          {categoria.percentual.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(categoria.percentual, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(categoria.valor_gasto)}</span>
                        <span>{formatCurrency(categoria.valor_orcado)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};