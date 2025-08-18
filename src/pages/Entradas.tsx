import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TransactionForm } from "@/components/TransactionForm";

interface Entrada {
  id: string;
  valor: number;
  data: string;
  categoria: string;
  nome: string;
  fonte?: string;
  forma_pagamento?: string;
  recorrente?: boolean;
  observacao?: string;
}

export const Entradas = () => {
  const { user } = useAuth();
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchEntradas = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo_movimento', 'entrada')
        .order('data', { ascending: false });

      if (error) throw error;
      setEntradas(data || []);
    } catch (error) {
      console.error('Erro ao buscar entradas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntradas();
  }, [user, refreshTrigger]);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowForm(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center">Carregando entradas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Entradas</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrada
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entradas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {entradas.length > 0 ? (
            <div className="space-y-4">
              {entradas.map((entrada) => (
                <div key={entrada.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{entrada.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {entrada.categoria} • {formatDate(entrada.data)}
                    </p>
                    {entrada.fonte && (
                      <p className="text-sm text-muted-foreground">Fonte: {entrada.fonte}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(entrada.valor)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entrada.forma_pagamento}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma entrada encontrada
            </p>
          )}
        </CardContent>
      </Card>

      <TransactionForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleSuccess}
        userId={user?.id || ""}
      />
    </div>
  );
};