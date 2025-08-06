import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionForm } from "@/components/TransactionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Movimentacao {
  id: string;
  valor: number;
  data: string;
  categoria: string;
  nome: string;
  forma_pagamento?: string;
  estabelecimento?: string;
  fonte?: string;
  observacao?: string;
}

export const Movimentacoes = () => {
  const { user } = useAuth();
  const [entradas, setEntradas] = useState<Movimentacao[]>([]);
  const [saidas, setSaidas] = useState<Movimentacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'entrada' | 'saida'>('entrada');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchMovimentacoes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Buscar o número de WhatsApp do usuário logado
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('numero_wpp')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const userWhatsapp = (profileData as any)?.numero_wpp;
      console.log('User WhatsApp:', userWhatsapp);

      if (!userWhatsapp) {
        console.log('Usuário não tem WhatsApp conectado');
        setEntradas([]);
        setSaidas([]);
        return;
      }

      // Buscar TODOS os registros deste número de WhatsApp 
      // @ts-ignore - evitar erro de tipagem excessiva do Supabase
      const { data: allData, error: allError } = await supabase
        .from('registros_financeiros')
        .select('*')
        .eq('numero_wpp', userWhatsapp)
        .order('data', { ascending: false });

      if (allError) throw allError;

      console.log('Dados encontrados para WhatsApp:', userWhatsapp, allData);

      // Separar entradas e saídas baseado na categoria ou outros campos
      const entradasList: Movimentacao[] = [];
      const saidasList: Movimentacao[] = [];

      (allData || []).forEach((item: any) => {
        // Determinar se é entrada baseado em palavras-chave na categoria
        const categoria = (item.categoria || '').toLowerCase();
        const isEntrada = categoria.includes('pagamento') || 
                         categoria.includes('salário') ||
                         categoria.includes('renda') ||
                         categoria.includes('recebimento') ||
                         categoria.includes('entrada') ||
                         item.tipo === 'entrada' ||
                         item.tipo_movimento === 'entrada';

        const movimentacao: Movimentacao = {
          id: item.id,
          valor: item.valor,
          data: item.data,
          categoria: item.categoria || 'Sem categoria',
          nome: item.nome || 'Sem nome',
          forma_pagamento: item.forma_pagamento,
          estabelecimento: item.estabelecimento,
          observacao: item.observacao
        };

        if (isEntrada) {
          entradasList.push(movimentacao);
        } else {
          saidasList.push(movimentacao);
        }
      });

      console.log('Entradas encontradas:', entradasList.length);
      console.log('Saídas encontradas:', saidasList.length);

      setEntradas(entradasList);
      setSaidas(saidasList);

    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimentacoes();
  }, [user, refreshTrigger]);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
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

  const openForm = (type: 'entrada' | 'saida') => {
    setFormType(type);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando movimentações...</div>
      </div>
    );
  }

  const renderMovimentacoes = (movimentacoes: Movimentacao[], tipo: 'entrada' | 'saida') => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {tipo === 'entrada' ? 'Entradas Registradas' : 'Saídas Registradas'}
        </h2>
        <Button onClick={() => openForm(tipo)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {tipo === 'entrada' ? 'Nova Entrada' : 'Nova Saída'}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {tipo === 'entrada' ? 'Entradas' : 'Saídas'} ({movimentacoes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movimentacoes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma {tipo} registrada ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {movimentacoes.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.categoria} • {formatDate(item.data)}
                        </p>
                        {item.estabelecimento && (
                          <p className="text-sm text-muted-foreground">
                            {item.estabelecimento}
                          </p>
                        )}
                        {item.fonte && (
                          <p className="text-sm text-muted-foreground">
                            Fonte: {item.fonte}
                          </p>
                        )}
                        {item.forma_pagamento && (
                          <p className="text-sm text-muted-foreground">
                            {item.forma_pagamento}
                          </p>
                        )}
                        {item.observacao && (
                          <p className="text-sm text-muted-foreground italic">
                            {item.observacao}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tipo === 'entrada' ? '+' : '-'} {formatCurrency(item.valor)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Movimentações Financeiras</h1>
      </div>

      <Tabs defaultValue="entradas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="saidas">Saídas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entradas" className="space-y-6">
          {renderMovimentacoes(entradas, 'entrada')}
        </TabsContent>
        
        <TabsContent value="saidas" className="space-y-6">
          {renderMovimentacoes(saidas, 'saida')}
        </TabsContent>
      </Tabs>

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