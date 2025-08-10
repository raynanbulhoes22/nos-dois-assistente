import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { FloatingSearchFilters } from "@/components/movimentacoes/FloatingSearchFilters";
import { MovimentacaoMetrics } from "@/components/movimentacoes/MovimentacaoMetrics";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export const Movimentacoes = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { movimentacoes, entradas, saidas, isLoading, error, refetch } = useMovimentacoes();
  const { 
    filters,
    baseFilteredMovimentacoes,
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

  // Handle navigation state for opening form
  useEffect(() => {
    const state = location.state as { openForm?: boolean; formType?: string } | null;
    if (state?.openForm && state?.formType) {
      const type = state.formType === 'entrada' ? 'entrada' : 'saida';
      setFormType(type);
      setShowForm(true);
      // Clear the state to prevent reopening on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  // Calculate invariant totals based on base filtered data (ignoring selected tab)
  const baseEntradas = baseFilteredMovimentacoes.filter(m => m.isEntrada);
  const baseSaidas = baseFilteredMovimentacoes.filter(m => !m.isEntrada);
  const totalEntradas = baseEntradas.reduce((sum, item) => sum + item.valor, 0);
  const totalSaidas = baseSaidas.reduce((sum, item) => sum + item.valor, 0);
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
    <div className="page-container">
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <h1 className="page-title">Movimentações</h1>
        </div>

        {/* Summary Cards */}
        <MovimentacaoMetrics
          totalEntradas={totalEntradas}
          totalSaidas={totalSaidas}
          saldo={saldo}
          entradasCount={baseEntradas.length}
          saidasCount={baseSaidas.length}
          totalEntradasCount={entradas.length}
          totalSaidasCount={saidas.length}
          formatCurrency={formatCurrency}
        />

        {/* Floating Search and Filters */}
        <FloatingSearchFilters
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
            <div className="px-4 sm:px-6 pb-3">
              <TabsList className="grid w-full max-w-md grid-cols-3 h-10">
                <TabsTrigger value="todas" className="text-sm">Todas</TabsTrigger>
                <TabsTrigger value="entradas" className="text-sm">Entradas</TabsTrigger>
                <TabsTrigger value="saidas" className="text-sm">Saídas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="todas" className="flex-1 px-4 sm:px-6 pb-4 overflow-hidden">
              {filteredMovimentacoes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon bg-muted">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma movimentação encontrada'}
                    </h3>
                    {!hasActiveFilters && (
                      <p className="text-muted-foreground mt-1">Adicione uma nova transação</p>
                    )}
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters} className="mt-4" size="sm">
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
          initialType={formType}
          editTransaction={editingMovimentacao ? {
            id: editingMovimentacao.id,
            tipo: editingMovimentacao.isEntrada ? 'entrada_manual' : 'registro_manual',
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
    </div>
  );
};