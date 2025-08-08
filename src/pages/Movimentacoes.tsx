import { useState } from "react";
import type { Movimentacao as MovType } from "@/hooks/useMovimentacoes";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useMovimentacoesFilters } from "@/hooks/useMovimentacoesFilters";
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
import { MovimentacoesFilters } from "@/components/MovimentacoesFilters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export const Movimentacoes = () => {
  const { user } = useAuth();
  const { movimentacoes, entradas, saidas, isLoading, error, refetch } = useMovimentacoes();
  const { 
    filters,
    filteredMovimentacoes,
    filteredEntradas,
    filteredSaidas,
    availableCategories,
    availablePaymentMethods,
    valueRange,
    updateFilter,
    setPeriodPreset,
    clearFilters,
    hasActiveFilters
  } = useMovimentacoesFilters(movimentacoes);
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

  // Calculate totals based on filtered data
  const totalEntradas = filteredEntradas.reduce((sum, item) => sum + item.valor, 0);
  const totalSaidas = filteredSaidas.reduce((sum, item) => sum + item.valor, 0);
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
    <div className="flex flex-col h-full">
      {/* Compact Header */}
      <div className="p-3 sm:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Movimentações</h1>
            <p className="text-muted-foreground text-sm">
              {filteredMovimentacoes.length} de {movimentacoes.length} transações
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Nova</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Summary Cards */}
      <div className="px-3 sm:px-4 py-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-card rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Entradas</span>
            </div>
            <div className="text-sm sm:text-lg font-bold text-green-600">
              {formatCurrency(totalEntradas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredEntradas.length} de {entradas.length}
            </p>
          </div>

          <div className="bg-card rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Saídas</span>
            </div>
            <div className="text-sm sm:text-lg font-bold text-red-600">
              {formatCurrency(totalSaidas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSaidas.length} de {saidas.length}
            </p>
          </div>

          <div className="bg-card rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <div className={`h-2 w-2 rounded-full ${saldo >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">Saldo</span>
            </div>
            <div className={`text-sm sm:text-lg font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total geral
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 sm:px-4">
        <MovimentacoesFilters
          filters={filters}
          availableCategories={availableCategories}
          availablePaymentMethods={availablePaymentMethods}
          valueRange={valueRange}
          onFilterChange={updateFilter}
          onPeriodPresetChange={setPeriodPreset}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          resultCount={filteredMovimentacoes.length}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs 
          defaultValue="todas" 
          className="flex flex-col h-full"
          value={filters.transactionType === 'all' ? 'todas' : filters.transactionType}
          onValueChange={(value) => {
            const type = value === 'todas' ? 'all' : value as 'entradas' | 'saidas';
            updateFilter('transactionType', type);
          }}
        >
          <div className="px-3 sm:px-4 pb-3">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-9">
              <TabsTrigger value="todas" className="text-xs">Todas</TabsTrigger>
              <TabsTrigger value="entradas" className="text-xs">Entradas</TabsTrigger>
              <TabsTrigger value="saidas" className="text-xs">Saídas</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="todas" className="flex-1 px-3 sm:px-4 pb-4 overflow-hidden">
            {filteredMovimentacoes.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma movimentação encontrada'}
                  </p>
                  {!hasActiveFilters && (
                    <p className="text-sm text-muted-foreground mt-1">Adicione uma nova transação</p>
                  )}
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="mt-2" size="sm">
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-hidden">
                <MovimentacoesList
                  items={filteredMovimentacoes}
                  onItemClick={(m) => {
                    setSelected(m);
                    setDetailsOpen(true);
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicate}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="entradas" className="flex-1 px-3 sm:px-4 pb-4 overflow-hidden">
            {filteredEntradas.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {hasActiveFilters ? 'Nenhuma entrada encontrada' : 'Nenhuma entrada registrada'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="mt-2" size="sm">
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-hidden">
                <MovimentacoesList
                  items={filteredEntradas}
                  onItemClick={(m) => {
                    setSelected(m);
                    setDetailsOpen(true);
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicate}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="saidas" className="flex-1 px-3 sm:px-4 pb-4 overflow-hidden">
            {filteredSaidas.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {hasActiveFilters ? 'Nenhuma saída encontrada' : 'Nenhuma saída registrada'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="mt-2" size="sm">
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-hidden">
                <MovimentacoesList
                  items={filteredSaidas}
                  onItemClick={(m) => {
                    setSelected(m);
                    setDetailsOpen(true);
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicate}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
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

      {selected && (
        <MovimentacaoDetailsDialog
          movimentacao={selected}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta movimentação?
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