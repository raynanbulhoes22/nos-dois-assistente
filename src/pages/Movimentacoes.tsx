import { useState } from "react";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { MovimentacaoCard } from "@/components/MovimentacaoCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { TransactionForm } from "@/components/TransactionForm";
import { useAuth } from "@/hooks/useAuth";

export const Movimentacoes = () => {
  const { user } = useAuth();
  const { movimentacoes, entradas, saidas, isLoading, error, refetch } = useMovimentacoes();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'entrada' | 'saida'>('entrada');

  const handleSuccess = () => {
    setShowForm(false);
    refetch();
  };

  const openForm = (type: 'entrada' | 'saida') => {
    setFormType(type);
    setShowForm(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalEntradas = entradas.reduce((sum, item) => sum + item.valor, 0);
  const totalSaidas = saidas.reduce((sum, item) => sum + item.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Movimentações Financeiras</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas entradas e saídas financeiras
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEntradas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {entradas.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSaidas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {saidas.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <div className={`h-4 w-4 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {saldo >= 0 ? <TrendingUp /> : <TrendingDown />}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              saldo >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(saldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              {movimentacoes.length} transações totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Movimentações */}
      <Tabs defaultValue="todas" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="entradas">Entradas</TabsTrigger>
            <TabsTrigger value="saidas">Saídas</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button onClick={() => openForm('entrada')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Entrada
            </Button>
            <Button onClick={() => openForm('saida')} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Saída
            </Button>
          </div>
        </div>

        <TabsContent value="todas" className="space-y-4">
          {movimentacoes.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  Nenhuma movimentação encontrada.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione uma nova transação para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {movimentacoes.map((movimentacao) => (
                <MovimentacaoCard key={movimentacao.id} movimentacao={movimentacao} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="entradas" className="space-y-4">
          {entradas.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  Nenhuma entrada registrada ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {entradas.map((movimentacao) => (
                <MovimentacaoCard key={movimentacao.id} movimentacao={movimentacao} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saidas" className="space-y-4">
          {saidas.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  Nenhuma saída registrada ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {saidas.map((movimentacao) => (
                <MovimentacaoCard key={movimentacao.id} movimentacao={movimentacao} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <TransactionForm
          open={showForm}
          onOpenChange={setShowForm}
          onSuccess={handleSuccess}
          userId={user?.id || ''}
        />
      )}
    </div>
  );
};