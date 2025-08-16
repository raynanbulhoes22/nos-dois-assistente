import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Edit2, TrendingUp, TrendingDown, Plus, AlertCircle, Minus, Target, Clock, DollarSign } from 'lucide-react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useFinancialStats } from '@/hooks/useFinancialStats';
import { useAuth } from '@/hooks/useAuth';
import { useSaldoEsperado } from '@/hooks/useSaldoEsperado';
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
  
  // Hook para calcular saldo esperado (usando saldo inicial como base)
  const saldoEsperado = useSaldoEsperado(saldoInicialFromDB);

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

  const getStatusBadge = (valor: number) => {
    if (valor >= saldoInicialFromDB * 1.3) return { variant: "default" as const, text: "Excelente", class: "bg-success text-white" };
    if (valor >= saldoInicialFromDB * 1.1) return { variant: "secondary" as const, text: "Bom", class: "bg-accent text-white" };
    if (valor >= saldoInicialFromDB * 0.9) return { variant: "outline" as const, text: "Estável", class: "bg-info text-white" };
    if (valor >= 0) return { variant: "destructive" as const, text: "Atenção", class: "bg-warning text-white" };
    return { variant: "destructive" as const, text: "Crítico", class: "bg-error text-white" };
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
      {/* New Grid Layout with 4 Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
        {/* Card 1: Saldo Inicial */}
        <Card className="metric-card metric-card-primary group cursor-pointer" onClick={handleEditSaldo}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="icon-container icon-primary">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Saldo Inicial
                  </span>
                </div>
                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {formatCurrency(saldoInicialFromDB || 0)}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-help">
                      Clique para editar
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Defina o valor inicial do mês</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Saldo Atual */}
        <Card className="metric-card metric-card-success">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="icon-container icon-success">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Saldo Atual
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {formatCurrency(saldoAtualComputado || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Inicial + movimentações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Evolução */}
        <Card className={`metric-card ${evolucaoSaldo >= 0 ? 'metric-card-success' : 'metric-card-error'}`}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`icon-container ${evolucaoSaldo >= 0 ? 'icon-success' : 'icon-error'}`}>
                  {evolucaoSaldo >= 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Evolução
                </span>
              </div>
              <div className="space-y-1">
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  evolucaoSaldo >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {evolucaoSaldo >= 0 ? '+' : ''}{formatCurrency(evolucaoSaldo)}
                </p>
                <p className={`text-xs ${
                  evolucaoPercentual >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {evolucaoPercentual >= 0 ? '+' : ''}{evolucaoPercentual.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Saldo Esperado */}
        <Card className={`metric-card ${saldoEsperado.saldoProjetado >= saldoInicialFromDB ? 'metric-card-success' : 'metric-card-warning'}`}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`icon-container ${saldoEsperado.saldoProjetado >= saldoInicialFromDB ? 'icon-success' : 'icon-warning'}`}>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Saldo Esperado
                </span>
              </div>
              <div className="space-y-1">
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                  saldoEsperado.saldoProjetado >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {formatCurrency(saldoEsperado.saldoProjetado)}
                </p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    final do mês
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1 py-0 h-4 ${getStatusBadge(saldoEsperado.saldoProjetado).class}`}
                      >
                        {getStatusBadge(saldoEsperado.saldoProjetado).text}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1 text-xs">
                        <p><strong>Cálculo:</strong></p>
                        <p>• Saldo inicial: {formatCurrency(saldoInicialFromDB)}</p>
                        <p>• + Receitas: {formatCurrency(saldoEsperado.rendaMensal)}</p>
                        <p>• - Gastos fixos: {formatCurrency(saldoEsperado.gastoFixoMensal)}</p>
                        <p>• - Parcelas: {formatCurrency(saldoEsperado.parcelasMensal)}</p>
                        <p>• - Faturas: {formatCurrency(saldoEsperado.faturasMensal)}</p>
                        <p className="border-t pt-1 font-semibold">• = Saldo esperado: <span className={saldoEsperado.saldoProjetado >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(saldoEsperado.saldoProjetado)}
                        </span></p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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