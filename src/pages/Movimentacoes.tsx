import { useState } from "react";
import type { Movimentacao as MovType } from "@/hooks/useMovimentacoes";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { TransactionForm } from "@/components/TransactionForm";
import { useAuth } from "@/hooks/useAuth";
import { MovimentacoesList } from "@/components/MovimentacoesList";
import { MovimentacaoDetailsDialog } from "@/components/MovimentacaoDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export const Movimentacoes = () => {
  const { user } = useAuth();
  const { movimentacoes, entradas, saidas, isLoading, error, refetch } = useMovimentacoes();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'entrada' | 'saida'>('entrada');
  const [selected, setSelected] = useState<MovType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState<MovType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [movimentacaoToDelete, setMovimentacaoToDelete] = useState<MovType | null>(null);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingMovimentacao(null);
    refetch();
  };

  const openForm = (type: 'entrada' | 'saida') => {
    setFormType(type);
    setEditingMovimentacao(null);
    setShowForm(true);
  };

  const handleEdit = (movimentacao: MovType) => {
    setEditingMovimentacao(movimentacao);
    setFormType(movimentacao.isEntrada ? 'entrada' : 'saida');
    setShowForm(true);
  };

  const handleDeleteClick = (movimentacao: MovType) => {
    setMovimentacaoToDelete(movimentacao);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!movimentacaoToDelete) return;

    try {
      const { error } = await supabase
        .from('registros_financeiros')
        .delete()
        .eq('id', movimentacaoToDelete.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso!",
        description: "Movimentação excluída com sucesso!"
      });

      refetch();
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível excluir a movimentação.",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setMovimentacaoToDelete(null);
    }
  };

  const handleDuplicate = (movimentacao: MovType) => {
    setEditingMovimentacao({
      ...movimentacao,
      id: '', // Remove o ID para criar uma nova movimentação
      data: new Date().toISOString().split('T')[0] // Data atual
    });
    setFormType(movimentacao.isEntrada ? 'entrada' : 'saida');
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Movimentações Financeiras</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie suas entradas e saídas financeiras
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" className="self-start sm:self-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
      <Tabs defaultValue="todas" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="todas" className="text-xs sm:text-sm">Todas</TabsTrigger>
            <TabsTrigger value="entradas" className="text-xs sm:text-sm">Entradas</TabsTrigger>
            <TabsTrigger value="saidas" className="text-xs sm:text-sm">Saídas</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-2 w-full sm:w-auto min-h-[44px] touch-manipulation"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Nova Transação</span>
              <span className="xs:hidden">Nova</span>
            </Button>
          </div>
        </div>

        <TabsContent value="todas" className="space-y-4">
          {movimentacoes.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">Nenhuma movimentação encontrada.</p>
                <p className="text-sm text-muted-foreground mt-2">Adicione uma nova transação para começar.</p>
              </CardContent>
            </Card>
          ) : (
            <MovimentacoesList
              items={movimentacoes}
              onItemClick={(m) => {
                setSelected(m);
                setDetailsOpen(true);
              }}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onDuplicate={handleDuplicate}
            />
          )}
        </TabsContent>

        <TabsContent value="entradas" className="space-y-4">
          {entradas.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">Nenhuma entrada registrada ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <MovimentacoesList
              items={entradas}
              onItemClick={(m) => {
                setSelected(m);
                setDetailsOpen(true);
              }}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onDuplicate={handleDuplicate}
            />
          )}
        </TabsContent>

        <TabsContent value="saidas" className="space-y-4">
          {saidas.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">Nenhuma saída registrada ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <MovimentacoesList
              items={saidas}
              onItemClick={(m) => {
                setSelected(m);
                setDetailsOpen(true);
              }}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onDuplicate={handleDuplicate}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <TransactionForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingMovimentacao(null);
          }}
          onSuccess={handleSuccess}
          userId={user?.id || ''}
          editTransaction={editingMovimentacao ? {
            id: editingMovimentacao.id,
            tipo: editingMovimentacao.isEntrada ? 'Receita' : 'Despesa',
            valor: editingMovimentacao.valor,
            data: editingMovimentacao.data,
            categoria: editingMovimentacao.categoria || '',
            nome: editingMovimentacao.nome || '',
            forma_pagamento: editingMovimentacao.forma_pagamento,
            estabelecimento: editingMovimentacao.estabelecimento,
            instituicao: editingMovimentacao.instituicao,
            origem: editingMovimentacao.origem,
            recorrente: editingMovimentacao.recorrente,
            observacao: editingMovimentacao.observacao
          } : null}
        />
      )}

      {/* Details Modal */}
      {selected && (
        <MovimentacaoDetailsDialog
          movimentacao={selected}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
              <br />
              <br />
              <strong>{movimentacaoToDelete?.nome}</strong>
              <br />
              Valor: {movimentacaoToDelete && formatCurrency(movimentacaoToDelete.valor)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};