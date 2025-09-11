import { useState, useEffect } from "react";
import { useOrcamentoUnificado } from "@/hooks/useOrcamentoUnificado";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Target, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { ContaParceladaForm } from "@/components/ContaParceladaForm";
import { GastoFixoForm } from "@/components/GastoFixoForm";
import { MiniTimeline } from "@/components/orcamento/MiniTimeline";
import { MetricCard } from "@/components/orcamento/MetricCard";
import { CalendarioFinanceiro } from "@/components/calendario/CalendarioFinanceiro";
import { SaldoInicialCard } from "@/components/orcamento/SaldoInicialCard";

export const Orcamento = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Estados da interface
  const [showFonteModal, setShowFonteModal] = useState(false);
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [tipoGasto, setTipoGasto] = useState<'fixo' | 'parcela'>('fixo');

  // Form states simplificados
  const [fonteForm, setFonteForm] = useState({
    tipo: '',
    valor: '',
    descricao: '',
    ativa: true
  });

  // Hook unificado - fonte única de verdade
  const {
    mesAtual,
    anoAtual,
    fontesRenda,
    gastosUnificados,
    totalRendaAtiva,
    totalRendaRecebida,
    totalRendaPendente,
    totalGastosAtivos,
    totalGastosPagos,
    totalGastosPendentes,
    saldoInicial,
    saldoAtual,
    saldoProjetado,
    timelineMeses,
    isLoading,
    error,
    formatCurrency,
    getMesNome,
    navegarMes,
    refetch,
    addFonte,
    updateFonte,
    deleteFonte,
    updateStatusRenda,
    createGastoFixo,
    updateGastoFixo,
    deleteGastoFixo,
    updateStatusGastoFixo,
    createConta,
    updateConta,
    deleteConta,
    updateStatusParcela,
    orcamentoAtual
  } = useOrcamentoUnificado();

  // SEO: título da página dinâmico
  useEffect(() => {
    document.title = `Orçamento | ${getMesNome(mesAtual)} ${anoAtual}`;
  }, [mesAtual, anoAtual, getMesNome]);

  // Handlers simplificados
  const handleAddFonte = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFonte({
        tipo: fonteForm.tipo,
        valor: parseFloat(fonteForm.valor),
        descricao: fonteForm.descricao,
        ativa: fonteForm.ativa
      });
      setShowFonteModal(false);
      resetFonteForm();
      refetch(); // Recalcular dados
      toast.success('Fonte de renda adicionada!');
    } catch (error) {
      toast.error('Erro ao adicionar fonte');
    }
  };

  const handleEditFonte = (fonte: any) => {
    setEditingItem(fonte);
    setFonteForm({
      tipo: fonte.tipo,
      valor: fonte.valor.toString(),
      descricao: fonte.descricao || '',
      ativa: fonte.ativa
    });
    setShowFonteModal(true);
  };

  const handleUpdateFonte = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateFonte(editingItem.id, {
        tipo: fonteForm.tipo,
        valor: parseFloat(fonteForm.valor),
        descricao: fonteForm.descricao,
        ativa: fonteForm.ativa
      });
      setShowFonteModal(false);
      setEditingItem(null);
      resetFonteForm();
      refetch();
      toast.success('Fonte atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar fonte');
    }
  };

  const handleEditGasto = (gasto: any) => {
    setEditingItem(gasto);
    setTipoGasto(gasto.tipoGasto);
    setShowGastoModal(true);
  };

  const handleDeleteGasto = async (gasto: any) => {
    try {
      if (gasto.tipoGasto === 'fixo') {
        await deleteGastoFixo(gasto.id);
      } else {
        await deleteConta(gasto.id);
      }
      refetch();
      toast.success('Item removido!');
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  const handleToggleStatusRenda = async (id: string, novoStatus: 'recebido' | 'pendente') => {
    try {
      await updateStatusRenda(id, novoStatus, mesAtual, anoAtual);
      refetch();
      toast.success(`Status alterado para ${novoStatus}`);
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handleToggleStatusGasto = async (gasto: any, novoStatus: 'pago' | 'pendente') => {
    try {
      if (gasto.tipoGasto === 'fixo') {
        await updateStatusGastoFixo(gasto.id, novoStatus as any, mesAtual, anoAtual);
      } else {
        await updateStatusParcela(gasto.id, novoStatus as any, mesAtual, anoAtual);
      }
      refetch();
      toast.success(`Status alterado para ${novoStatus}`);
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const resetFonteForm = () => {
    setFonteForm({
      tipo: '',
      valor: '',
      descricao: '',
      ativa: true
    });
  };

  // Loading state
  if (isLoading && !fontesRenda.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button onClick={refetch} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header com navegação */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Orçamento</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navegarMes('anterior')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {getMesNome(mesAtual)} {anoAtual}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navegarMes('proximo')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principais simplificadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Saldo Atual"
          value={formatCurrency(saldoAtual)}
          icon={DollarSign}
          variant={saldoAtual > saldoInicial ? 'success' : saldoAtual < saldoInicial ? 'error' : 'primary'}
        />
        <MetricCard
          title="Receitas Previstas"
          value={formatCurrency(totalRendaAtiva)}
          icon={TrendingUp}
          variant="success"
          subtitle={`${formatCurrency(totalRendaRecebida)} recebidas`}
        />
        <MetricCard
          title="Gastos Previstos"
          value={formatCurrency(totalGastosAtivos)}
          icon={TrendingDown}
          variant="warning"
          subtitle={`${formatCurrency(totalGastosPagos)} pagos`}
        />
      </div>

      {/* Timeline simplificada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Previsão dos Próximos Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineMeses.length > 0 ? (
            <MiniTimeline 
              previsoes={timelineMeses} 
              currentMonth={mesAtual}
              currentYear={anoAtual}
              onMonthSelect={(mes, ano) => navegarMes(mes > mesAtual ? 'proximo' : 'anterior')}
              getMesNome={getMesNome}
            />
          ) : (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Carregando timeline...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saldo inicial */}
      <SaldoInicialCard
        mes={mesAtual}
        ano={anoAtual}
      />

      {/* Abas simplificadas: apenas Receitas e Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Receitas
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total: {formatCurrency(totalRendaAtiva)}
                </p>
              </div>
              <Dialog open={showFonteModal} onOpenChange={setShowFonteModal}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Editar Receita' : 'Nova Receita'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={editingItem ? handleUpdateFonte : handleAddFonte} className="space-y-4">
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select value={fonteForm.tipo} onValueChange={(value) => setFonteForm(prev => ({ ...prev, tipo: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Salário">Salário</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Investimentos">Investimentos</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="valor">Valor</Label>
                      <CurrencyInput
                        value={parseFloat(fonteForm.valor) || 0}
                        onChange={(value) => setFonteForm(prev => ({ ...prev, valor: value?.toString() || '0' }))}
                        placeholder="R$ 0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        value={fonteForm.descricao}
                        onChange={(e) => setFonteForm(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descrição opcional"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={fonteForm.ativa}
                        onCheckedChange={(checked) => setFonteForm(prev => ({ ...prev, ativa: checked }))}
                      />
                      <Label>Ativo</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setShowFonteModal(false);
                        setEditingItem(null);
                        resetFonteForm();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingItem ? 'Atualizar' : 'Adicionar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fontesRenda.map((fonte) => (
                <div key={fonte.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{fonte.tipo}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded cursor-pointer ${
                          fonte.recebido 
                            ? 'bg-success/20 text-success' 
                            : 'bg-warning/20 text-warning'
                        }`}
                        onClick={() => handleToggleStatusRenda(fonte.id, fonte.recebido ? 'pendente' : 'recebido')}
                      >
                        {fonte.recebido ? 'Recebido' : 'Pendente'}
                      </span>
                    </div>
                    {fonte.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">{fonte.descricao}</p>
                    )}
                    <p className="font-semibold text-success">{formatCurrency(fonte.valor)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditFonte(fonte)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {fontesRenda.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma receita cadastrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gastos unificados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  Gastos
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total: {formatCurrency(totalGastosAtivos)}
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setTipoGasto('fixo')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Gasto Fixo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Gasto Fixo</DialogTitle>
                    </DialogHeader>
                    <GastoFixoForm 
                      onSubmit={async (data) => {
                        await createGastoFixo(data as any);
                        refetch();
                      }}
                      onCancel={() => {}} 
                    />
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setTipoGasto('parcela')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Parcelamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Parcelamento</DialogTitle>
                    </DialogHeader>
                    <ContaParceladaForm 
                      open={true}
                      onOpenChange={() => {}}
                      onSubmit={async (data) => {
                        await createConta(data);
                        refetch();
                        return true;
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gastosUnificados.map((gasto) => (
                <div key={gasto.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{gasto.nome || gasto.descricao}</h4>
                      <span className="px-2 py-1 text-xs rounded bg-muted">
                        {gasto.tipoGasto === 'fixo' ? 'Fixo' : 'Parcela'}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded cursor-pointer ${
                          gasto.pago 
                            ? 'bg-success/20 text-success' 
                            : 'bg-warning/20 text-warning'
                        }`}
                        onClick={() => handleToggleStatusGasto(gasto, gasto.pago ? 'pendente' : 'pago')}
                      >
                        {gasto.pago ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                    <p className="font-semibold text-destructive">{formatCurrency(gasto.valor_mensal)}</p>
                    {gasto.tipoGasto === 'parcela' && gasto.total_parcelas && (
                      <p className="text-xs text-muted-foreground">
                        {gasto.parcelas_pagas || 0}/{gasto.total_parcelas} parcelas
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditGasto(gasto)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {gastosUnificados.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum gasto cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendário financeiro */}
      <CalendarioFinanceiro
        mesAtual={mesAtual}
        anoAtual={anoAtual}
        onNavigate={navegarMes}
        getMesNome={getMesNome}
        timeline={timelineMeses}
      />
    </div>
  );
};

export default Orcamento;