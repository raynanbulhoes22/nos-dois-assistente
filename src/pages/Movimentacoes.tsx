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
import { useAuth } from "@/contexts/AuthContext";
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
      let type: 'entrada' | 'saida' = 'entrada';
      if (state.formType === 'entrada') type = 'entrada';
      else if (state.formType === 'saida' || state.formType === 'transferencia') type = 'saida';
      
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
        {/* Mobile-first Header */}
        <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Movimentações</h1>
                <p className="text-sm text-muted-foreground">Suas entradas e saídas</p>
              </div>
              
              {/* Desktop buttons only */}
              <div className="hidden md:flex items-center gap-3">
                <Button 
                  onClick={() => openForm('entrada')} 
                  className="bg-income hover:bg-income/90"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Entrada
                </Button>
                <Button 
                  onClick={() => openForm('saida')} 
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Saída
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Mobile optimized */}
        <div className="px-4 -mt-2">
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
        </div>

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
            {/* Web Navigation */}
            <div className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="px-6 py-3">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                  <TabsTrigger 
                    value="todas" 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Todas as Movimentações
                  </TabsTrigger>
                  <TabsTrigger 
                    value="entradas"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <TrendingUp className="h-4 w-4 mr-2 text-income" />
                    Entradas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="saidas"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <TrendingDown className="h-4 w-4 mr-2 text-expense" />
                    Saídas
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Mobile Navigation - Improved */}
            <div className="md:hidden px-4 pb-3">
              <TabsList className="grid w-full grid-cols-3 h-12 p-1">
                <TabsTrigger value="todas" className="text-xs font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <span>Todas</span>
                    <span className="text-xs opacity-75">{filteredMovimentacoes.length}</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="entradas" className="text-xs font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <span>Entradas</span>
                    <span className="text-xs opacity-75">{filteredEntradas.length}</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="saidas" className="text-xs font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <span>Saídas</span>
                    <span className="text-xs opacity-75">{filteredSaidas.length}</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="todas" className="flex-1 px-4 pb-4 overflow-hidden">
              {filteredMovimentacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma movimentação encontrada'}
                  </h3>
                  {!hasActiveFilters && (
                    <p className="text-muted-foreground text-sm mb-4">Adicione uma nova transação pelo botão + no canto inferior</p>
                  )}
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="mt-2" size="sm">
                      Limpar Filtros
                    </Button>
                  )}
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
          transactionSubType={location.state?.formType}
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