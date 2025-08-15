import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wallet, Edit2, TrendingUp, TrendingDown, Plus, AlertCircle } from 'lucide-react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useFinancialStats } from '@/hooks/useFinancialStats';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaldoInicialCardProps {
  mes: number;
  ano: number;
}

export const SaldoInicialCard = ({ mes, ano }: SaldoInicialCardProps) => {
  const { user } = useAuth();
  const { getOrcamentoByMesAno, updateOrcamento, createOrcamento, refetch } = useOrcamentos();
  const { saldoInicial, saldoComputado, saldoAtual } = useFinancialStats();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [novoSaldo, setNovoSaldo] = useState('');
  const [saldoInicialFromDB, setSaldoInicialFromDB] = useState<number>(0);
  const [saldoAtualComputado, setSaldoAtualComputado] = useState<number>(0);

  const orcamento = getOrcamentoByMesAno(mes, ano);
  // Usar o saldo dos registros financeiros em vez do orçamento
  const saldoInicialAtual = saldoInicialFromDB;

  // Buscar saldo inicial dos registros financeiros para este mês
  useEffect(() => {
    const buscarSaldoInicial = async () => {
      if (!user) return;
      
      const primeiroDiaMes = new Date(ano, mes - 1, 1);
      const ultimoDiaMes = new Date(ano, mes, 0);
      
      const { data: registroSaldo, error } = await supabase
        .from('registros_financeiros')
        .select('valor, tipo_movimento')
        .eq('user_id', user.id)
        .eq('categoria', 'Saldo Inicial')
        .gte('data', primeiroDiaMes.toISOString().split('T')[0])
        .lte('data', ultimoDiaMes.toISOString().split('T')[0])
        .maybeSingle();
      
      if (!error && registroSaldo) {
        const valor = registroSaldo.tipo_movimento === 'entrada' 
          ? registroSaldo.valor 
          : -registroSaldo.valor;
        setSaldoInicialFromDB(valor);
      } else {
        setSaldoInicialFromDB(0);
      }
    };
    
    buscarSaldoInicial();
  }, [user, mes, ano]);

  // Calcular saldo atual corretamente baseado no saldo inicial dos registros financeiros
  useEffect(() => {
    const calcularSaldoAtual = async () => {
      if (!user) return;
      
      const primeiroDiaMes = new Date(ano, mes - 1, 1);
      const ultimoDiaMes = new Date(ano, mes, 0);
      
      // Buscar todas as movimentações do mês (exceto saldo inicial)
      const { data: movimentacoes, error } = await supabase
        .from('registros_financeiros')
        .select('valor, tipo_movimento')
        .eq('user_id', user.id)
        .neq('categoria', 'Saldo Inicial')
        .gte('data', primeiroDiaMes.toISOString().split('T')[0])
        .lte('data', ultimoDiaMes.toISOString().split('T')[0]);
      
      if (!error && movimentacoes) {
        const totalMovimentacoes = movimentacoes.reduce((total, mov) => {
          const valor = mov.tipo_movimento === 'entrada' ? mov.valor : -mov.valor;
          return total + valor;
        }, 0);
        
        setSaldoAtualComputado(saldoInicialFromDB + totalMovimentacoes);
      }
    };
    
    calcularSaldoAtual();
  }, [user, mes, ano, saldoInicialFromDB]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEditSaldo = () => {
    setNovoSaldo(saldoInicialAtual.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveSaldo = async () => {
    if (!user) {
      toast({
        title: "❌ Erro",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('🔄 Iniciando atualização do saldo inicial...', { user: user.id, mes, ano, novoSaldo });
    
    try {
      const valorSaldo = parseFloat(novoSaldo.replace(',', '.')) || 0;
      console.log('💰 Valor processado:', valorSaldo);
      
      // 1. Atualizar/criar orçamento
      console.log('📊 Atualizando orçamento...', { orcamento: orcamento?.id });
      if (orcamento) {
        const result = await updateOrcamento(orcamento.id, { saldo_inicial: valorSaldo });
        console.log('✅ Orçamento atualizado:', result);
      } else {
        const result = await createOrcamento({
          mes,
          ano,
          saldo_inicial: valorSaldo,
          meta_economia: 0
        });
        console.log('✅ Orçamento criado:', result);
      }
      
      // 2. Verificar se já existe registro de saldo inicial para este mês
      const primeiroDiaMes = new Date(ano, mes - 1, 1);
      console.log('🔍 Verificando registro existente...', { 
        data: primeiroDiaMes.toISOString().split('T')[0],
        user_id: user.id 
      });
      
      const { data: registroExistente, error: selectError } = await supabase
        .from('registros_financeiros')
        .select('id, valor')
        .eq('user_id', user.id)
        .eq('categoria', 'Saldo Inicial')
        .eq('data', primeiroDiaMes.toISOString().split('T')[0])
        .maybeSingle();
      
      if (selectError) {
        console.error('❌ Erro ao buscar registro existente:', selectError);
        throw selectError;
      }
      
      console.log('📋 Registro existente encontrado:', registroExistente);
      
      if (registroExistente) {
        // 3a. Atualizar registro existente
        console.log('🔄 Atualizando registro existente...');
        const { error: updateError } = await supabase
          .from('registros_financeiros')
          .update({
            valor: Math.abs(valorSaldo),
            tipo: 'entrada_manual', // Valor correto conforme constraint
            tipo_movimento: valorSaldo >= 0 ? 'entrada' : 'saida',
            nome: `Saldo Inicial - ${new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
            observacao: 'Saldo inicial atualizado pelo usuário'
          })
          .eq('id', registroExistente.id);
          
        if (updateError) {
          console.error('❌ Erro ao atualizar registro:', updateError);
          throw updateError;
        }
        console.log('✅ Registro de saldo inicial atualizado');
      } else {
        // 3b. Criar novo registro
        console.log('➕ Criando novo registro...');
        const { error: insertError } = await supabase
          .from('registros_financeiros')
          .insert([{
            user_id: user.id,
            valor: Math.abs(valorSaldo),
            data: primeiroDiaMes.toISOString().split('T')[0],
            tipo: 'entrada_manual', // Valor correto conforme constraint
            tipo_movimento: valorSaldo >= 0 ? 'entrada' : 'saida',
            categoria: 'Saldo Inicial',
            nome: `Saldo Inicial - ${new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
            observacao: 'Saldo inicial definido pelo usuário',
            origem: 'manual'
          }]);
          
        if (insertError) {
          console.error('❌ Erro ao inserir registro:', insertError);
          throw insertError;
        }
        console.log('✅ Registro de saldo inicial criado');
      }
      
      // 4. Atualizar estado local imediatamente
      setSaldoInicialFromDB(valorSaldo);
      
      // 5. Recarregar dados do orçamento
      await refetch();
      
      toast({
        title: "✅ Sucesso!",
        description: "Saldo inicial atualizado com sucesso!"
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar saldo inicial:', error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar saldo inicial",
        variant: "destructive"
      });
    }
  };

  // Calcular evolução corretamente baseado nos dados dos registros financeiros
  const evolucaoSaldo = saldoAtualComputado - saldoInicialAtual;
  const isPositiveEvolution = evolucaoSaldo >= 0;

  return (
    <TooltipProvider>
      <div className="mt-3 pt-3 border-t border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Saldo Inicial</span>
        </div>
        
        {/* Layout Horizontal Compacto - 3 colunas como antes */}
        <div className="grid grid-cols-3 gap-3">
          {/* Saldo Inicial - Clicável e intuitivo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                onClick={handleEditSaldo}
                className={`
                  text-center p-2 rounded-lg cursor-pointer transition-all duration-200 group
                  ${saldoInicialAtual === 0 
                    ? 'border-dashed border-2 border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10' 
                    : 'bg-muted/30 hover:bg-muted/50 hover:shadow-md border border-transparent hover:border-primary/30'
                  }
                `}
              >
                {saldoInicialAtual === 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Plus className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary font-medium">DEFINIR</span>
                    </div>
                    <p className="text-xs text-primary font-medium mb-1">
                      Saldo Inicial
                    </p>
                    <p className="text-xs text-muted-foreground">
                      💰 Clique aqui
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-xs text-muted-foreground">SALDO INICIAL</span>
                      <Edit2 className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {formatCurrency(saldoInicialAtual)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      💰 Clique aqui
                    </p>
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {saldoInicialAtual === 0 
                  ? 'Clique para definir seu saldo inicial'
                  : 'Clique para editar o saldo inicial'
                }
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Saldo Atual Computado */}
          <div className={`text-center p-2 rounded-lg border ${
            saldoAtualComputado >= 0 ? 'bg-success/10 border-success/20' : 'bg-error/10 border-error/20'
          }`}>
            <span className="text-xs text-muted-foreground block mb-1">SALDO ATUAL</span>
            <div className="flex items-center justify-center gap-1">
              <p className={`text-sm font-semibold ${
                saldoAtualComputado >= 0 ? 'text-success' : 'text-error'
              }`}>
                {formatCurrency(saldoAtualComputado)}
              </p>
              {saldoAtualComputado >= 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-error" />
              )}
            </div>
          </div>

          {/* Evolução */}
          <div className="text-center p-2 rounded-lg bg-muted/20 border border-border/30">
            <span className="text-xs text-muted-foreground block mb-1">EVOLUÇÃO</span>
            <p className={`text-sm font-semibold ${
              isPositiveEvolution ? 'text-success' : 'text-error'
            }`}>
              {isPositiveEvolution ? '+' : ''}{formatCurrency(evolucaoSaldo)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              {saldoInicialAtual === 0 ? 'Definir Saldo Inicial' : 'Editar Saldo Inicial'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Explicação mais clara */}
            <div className="bg-muted/50 p-3 rounded-lg border border-border/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Quanto você tinha na carteira?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Informe o valor que você possuía no início de {mes}/{ano} 
                    (soma de dinheiro em conta, carteira, poupança, etc.)
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="saldo" className="text-sm font-medium">
                Saldo Inicial (R$)
              </Label>
              <Input
                id="saldo"
                type="text"
                placeholder="Ex: 1500,00"
                value={novoSaldo}
                onChange={(e) => setNovoSaldo(e.target.value)}
                className="text-center text-lg font-semibold mt-1"
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 font-medium"
                onClick={handleSaveSaldo}
              >
                {saldoInicialAtual === 0 ? 'Definir' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};