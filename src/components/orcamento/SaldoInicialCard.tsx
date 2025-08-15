import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wallet, Edit2, TrendingUp, TrendingDown, Plus, AlertCircle, Minus } from 'lucide-react';
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
  
  // Calcular porcentagem de evolução
  const evolucaoPercentual = saldoInicialAtual !== 0 
    ? ((evolucaoSaldo / Math.abs(saldoInicialAtual)) * 100)
    : 0;

  return (
    <TooltipProvider>
      <div className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg p-3 sm:p-4 border border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Wallet className="h-3 w-3 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Saldo do Mês</span>
        </div>
        
        {/* Layout Mobile First - Stack em mobile, grid em desktop */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-3">
          {/* Saldo Inicial - Mobile First */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                onClick={handleEditSaldo}
                className={`
                  p-3 sm:p-2 rounded-lg cursor-pointer transition-all duration-300 group
                  ${saldoInicialAtual === 0 
                    ? 'border-2 border-dashed border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10' 
                    : 'bg-card/60 hover:bg-card border border-border/40 hover:border-primary/40 shadow-sm hover:shadow-md'
                  }
                `}
              >
                {saldoInicialAtual === 0 ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Plus className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary font-semibold">Definir</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Toque para definir saldo inicial
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-xs text-muted-foreground font-medium">INICIAL</span>
                      <Edit2 className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm sm:text-base font-bold text-foreground">
                      {formatCurrency(saldoInicialAtual)}
                    </p>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                {saldoInicialAtual === 0 
                  ? 'Toque para definir saldo inicial'
                  : 'Toque para editar saldo inicial'
                }
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Saldo Atual - Mobile First */}
          <div className={`p-3 sm:p-2 rounded-lg border transition-all duration-300 text-center ${
            saldoAtualComputado >= 0 
              ? 'bg-success/5 border-success/30' 
              : 'bg-destructive/5 border-destructive/30'
          }`}>
            <span className="text-xs text-muted-foreground font-medium block mb-1">ATUAL</span>
            <div className="flex items-center justify-center gap-1">
              <p className={`text-sm sm:text-base font-bold ${
                saldoAtualComputado >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(saldoAtualComputado)}
              </p>
              {saldoAtualComputado >= 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
            </div>
          </div>

          {/* Evolução - Mobile First */}
          <div className="p-3 sm:p-2 rounded-lg bg-muted/40 border border-border/30 text-center">
            <span className="text-xs text-muted-foreground font-medium block mb-1">VARIAÇÃO</span>
            <div className="flex items-center justify-center gap-1">
              {isPositiveEvolution ? (
                <Plus className="h-3 w-3 text-success" />
              ) : (
                <Minus className="h-3 w-3 text-destructive" />
              )}
              <div>
                <p className={`text-sm sm:text-base font-bold ${
                  isPositiveEvolution ? 'text-success' : 'text-destructive'
                }`}>
                  {formatCurrency(Math.abs(evolucaoSaldo))}
                </p>
                {saldoInicialAtual !== 0 && (
                  <p className={`text-xs ${
                    isPositiveEvolution ? 'text-success/70' : 'text-destructive/70'
                  }`}>
                    {evolucaoPercentual > 0 ? '+' : ''}{evolucaoPercentual.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição - Mobile Optimized */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-sm mx-auto rounded-lg">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              {saldoInicialAtual === 0 ? 'Definir Saldo' : 'Editar Saldo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Explicação Mobile First */}
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Quanto você tinha na carteira?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Informe o valor total que você possuía no início de {mes}/{ano}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="saldo" className="text-sm font-medium">
                Saldo Inicial (R$)
              </Label>
              <Input
                id="saldo"
                type="text"
                placeholder="Ex: 1500,00"
                value={novoSaldo}
                onChange={(e) => setNovoSaldo(e.target.value)}
                className="text-center text-lg font-semibold h-12"
                autoFocus
              />
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 order-2 sm:order-1"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="w-full sm:flex-1 font-medium order-1 sm:order-2"
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