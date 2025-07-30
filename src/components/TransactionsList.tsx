import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionForm } from "./TransactionForm";

interface Transaction {
  id: string;
  tipo: string;
  valor: number;
  data: string;
  categoria: string;
  nome: string;
  forma_pagamento?: string;
  estabelecimento?: string;
  instituicao?: string;
  origem?: string;
  recorrente?: boolean;
  observacao?: string;
  tipo_movimento: string;
}

interface TransactionsListProps {
  userId: string;
  refreshTrigger: number;
}

export const TransactionsList = ({ userId, refreshTrigger }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(15);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId, refreshTrigger]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setShowEditForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTransaction) return;

    try {
      const { error } = await supabase
        .from('registros_financeiros')
        .delete()
        .eq('id', deleteTransaction.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso."
      });

      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setDeleteTransaction(null);
    }
  };

  const confirmDelete = (transaction: Transaction) => {
    setDeleteTransaction(transaction);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando transações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Forma Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.data)}</TableCell>
                      <TableCell className="font-medium">{transaction.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          transaction.tipo_movimento === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.tipo_movimento === 'entrada' ? '+' : '-'}
                          {formatCurrency(transaction.valor)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.tipo === 'Receita' ? 'default' : 'secondary'}>
                          {transaction.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.forma_pagamento || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => confirmDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma transação encontrada</p>
              <p className="text-sm text-gray-400">
                Comece adicionando sua primeira transação financeira
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Edição */}
      <TransactionForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={fetchTransactions}
        editTransaction={editTransaction}
        userId={userId}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a transação "{deleteTransaction?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};