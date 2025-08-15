import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
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
  const { getOrcamentoByMesAno, updateOrcamento, createOrcamento } = useOrcamentos();
  const { saldoInicial, saldoComputado, saldoAtual } = useFinancialStats();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [novoSaldo, setNovoSaldo] = useState('');

  const orcamento = getOrcamentoByMesAno(mes, ano);
  const saldoInicialAtual = orcamento?.saldo_inicial || 0;
  
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

  const evolucaoSaldo = saldoComputado - saldoInicialAtual;
  const isPositiveEvolution = evolucaoSaldo >= 0;

  return (
    <>
      <div className="mt-3 pt-3 border-t border-border/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Saldo Inicial</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditSaldo}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Layout Horizontal Compacto */}
        <div className="grid grid-cols-3 gap-3">
          {/* Saldo Inicial */}
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <span className="text-xs text-muted-foreground block mb-1">SALDO INICIAL</span>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(saldoInicialAtual)}
            </p>
          </div>

          {/* Saldo Atual Computado */}
          <div className={`text-center p-2 rounded-lg ${
            isPositiveEvolution ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'
          }`}>
            <span className="text-xs text-muted-foreground block mb-1">SALDO ATUAL</span>
            <div className="flex items-center justify-center gap-1">
              <p className={`text-sm font-semibold ${
                isPositiveEvolution ? 'text-success' : 'text-error'
              }`}>
                {formatCurrency(saldoComputado)}
              </p>
              {isPositiveEvolution ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-error" />
              )}
            </div>
          </div>

          {/* Evolução */}
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <span className="text-xs text-muted-foreground block mb-1">EVOLUÇÃO</span>
            <p className={`text-sm font-semibold ${
              isPositiveEvolution ? 'text-success' : 'text-error'
            }`}>
              {isPositiveEvolution ? '+' : ''}{formatCurrency(evolucaoSaldo)}
            </p>
          </div>
        </div>

        {saldoInicialAtual === 0 && (
          <div className="mt-2 text-center p-2 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-warning">
              Configure seu saldo inicial para um controle mais preciso
            </p>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Saldo Inicial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="saldo">Saldo Inicial (R$)</Label>
              <Input
                id="saldo"
                type="text"
                placeholder="0,00"
                value={novoSaldo}
                onChange={(e) => setNovoSaldo(e.target.value)}
                className="text-center"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Valor que você tinha no início de {mes}/{ano}
              </p>
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
                className="flex-1"
                onClick={handleSaveSaldo}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};