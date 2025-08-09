import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Plus,
  CreditCard,
  PiggyBank,
  AlertTriangle,
  Eye
} from 'lucide-react';

// Hooks
import { usePrevisibilidadeFinanceira } from '@/hooks/usePrevisibilidadeFinanceira';
import { useContasParceladas } from '@/hooks/useContasParceladas';
import { useFontesRenda } from '@/hooks/useFontesRenda';

// Components
import { TimelinePrevisao } from '@/components/previsibilidade/TimelinePrevisao';
import { CardCompromisso } from '@/components/previsibilidade/CardCompromisso';
import { AlertaFluxo } from '@/components/previsibilidade/AlertaFluxo';
import { DetalheMensalDialog } from '@/components/previsibilidade/DetalheMensalDialog';

// Forms
import { ContaParceladaForm } from '@/components/ContaParceladaForm';

import type { PrevisaoMensal } from '@/hooks/usePrevisibilidadeFinanceira';
import type { ContaParcelada } from '@/hooks/useContasParceladas';

export default function PrevisibilidadeFinanceira() {
  const {
    previsoes,
    alertas,
    isLoading,
    getProximosDeficits,
    getProximosTerminos,
    getTotalCompromissosAtivos,
    getSaldoProjetado6Meses,
    getMesNome
  } = usePrevisibilidadeFinanceira();

  const { 
    contas, 
    updateConta, 
    deleteConta 
  } = useContasParceladas();

  const { 
    fontes, 
    getTotalRendaAtiva 
  } = useFontesRenda();

  // Estados dos modais
  const [showParcelamentoForm, setShowParcelamentoForm] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaParcelada | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<PrevisaoMensal | null>(null);
  const [showMonthDetail, setShowMonthDetail] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAddCompromisso = () => {
    setEditingConta(null);
    setShowParcelamentoForm(true);
  };

  const handleEditCompromisso = (conta: ContaParcelada) => {
    setEditingConta(conta);
    setShowParcelamentoForm(true);
  };

  const handleDeleteCompromisso = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este compromisso?')) {
      await deleteConta(id);
    }
  };

  const handleMesClick = (previsao: PrevisaoMensal) => {
    setSelectedMonth(previsao);
    setShowMonthDetail(true);
  };

  const getStatusMetrica = () => {
    const proximosDeficits = getProximosDeficits();
    if (proximosDeficits.length > 0) {
      return {
        status: 'deficit',
        texto: `${proximosDeficits.length} mês(es) com déficit`,
        cor: 'text-error'
      };
    }

    const saldo6Meses = getSaldoProjetado6Meses();
    if (saldo6Meses > getTotalRendaAtiva() * 2) {
      return {
        status: 'excelente',
        texto: 'Situação financeira excelente',
        cor: 'text-success'
      };
    }

    return {
      status: 'estavel',
      texto: 'Situação financeira estável',
      cor: 'text-primary'
    };
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const statusGeral = getStatusMetrica();
  const proximosTerminos = getProximosTerminos();

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Previsibilidade Financeira</h1>
              <p className="page-subtitle">
                Veja o que vem pela frente nos próximos 12 meses
              </p>
            </div>
            <Button onClick={handleAddCompromisso} className="button-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Novo Compromisso
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="metric-grid mb-8">
          <Card className="metric-card metric-card-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="icon-container icon-primary">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(getTotalRendaAtiva())}
                  </div>
                  <div className="text-sm text-muted-foreground">Renda Mensal</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card metric-card-error">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="icon-container icon-error">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(getTotalCompromissosAtivos())}
                  </div>
                  <div className="text-sm text-muted-foreground">Compromissos Mensais</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card metric-card-success">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="icon-container icon-success">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(getSaldoProjetado6Meses())}
                  </div>
                  <div className="text-sm text-muted-foreground">Projeção 6 Meses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="icon-container icon-primary">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <div className={`text-lg font-semibold ${statusGeral.cor}`}>
                    {statusGeral.texto}
                  </div>
                  <div className="text-sm text-muted-foreground">Status Geral</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline de Previsões */}
        <Card className="section-card mb-8">
          <CardContent className="p-6">
            <TimelinePrevisao
              previsoes={previsoes}
              getMesNome={getMesNome}
              onMesClick={handleMesClick}
            />
          </CardContent>
        </Card>

        <div className="section-grid">
          {/* Alertas Financeiros */}
          <Card className="section-card">
            <CardContent className="p-6">
              <AlertaFluxo alertas={alertas} />
            </CardContent>
          </Card>

          {/* Resumo Rápido */}
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Próximos Términos */}
              {proximosTerminos.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Compromissos Finalizando</h4>
                  <div className="space-y-2">
                    {proximosTerminos.map((termino, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/10 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">{termino.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {getMesNome(termino.mes)} {termino.ano}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-success">
                            +{formatCurrency(termino.valor)}
                          </div>
                          <div className="text-xs text-muted-foreground">liberado</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Compromissos Totais */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Estatísticas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compromissos ativos:</span>
                    <span className="font-medium text-foreground">{contas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">% da renda comprometida:</span>
                    <span className="font-medium text-foreground">
                      {((getTotalCompromissosAtivos() / getTotalRendaAtiva()) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margem livre:</span>
                    <span className="font-medium text-success">
                      {formatCurrency(getTotalRendaAtiva() - getTotalCompromissosAtivos())}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Compromissos */}
        {contas.length > 0 && (
          <Card className="section-card mt-8">
            <CardHeader>
              <CardTitle>Seus Compromissos ({contas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contas.map((conta) => (
                  <CardCompromisso
                    key={conta.id}
                    conta={conta}
                    onEdit={handleEditCompromisso}
                    onDelete={handleDeleteCompromisso}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <ContaParceladaForm
          open={showParcelamentoForm}
          onOpenChange={setShowParcelamentoForm}
          editingConta={editingConta}
          onSubmit={async (conta) => {
            setShowParcelamentoForm(false);
            return true;
          }}
        />

        <DetalheMensalDialog
          previsao={selectedMonth}
          open={showMonthDetail}
          onOpenChange={setShowMonthDetail}
          getMesNome={getMesNome}
        />
      </div>
    </div>
  );
}