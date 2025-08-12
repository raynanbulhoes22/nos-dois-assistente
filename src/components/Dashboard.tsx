import { StatusAtualCard } from "./dashboard/StatusAtualCard";
import { CompromissosMensaisCard } from "./dashboard/CompromissosMensaisCard";
import { ProjecaoMensalCard } from "./dashboard/ProjecaoMensalCard";
import { InsightsActionCard } from "./dashboard/InsightsActionCard";
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";
import { useMemo } from "react";
interface User {
  id: string;
  email?: string;
}
interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const { comparativo, isLoading } = useComparativoFinanceiro();

  // Calcular métricas para StatusAtualCard
  const metricas = useMemo(() => {
    const saldoAtual = comparativo.rendaRealizada - comparativo.gastosRealizados;
    const comprometimentoMes = comparativo.gastosProjetados;
    const saldoDisponivel = saldoAtual - comprometimentoMes;
    
    return {
      saldoAtual,
      comprometimentoMes,
      saldoDisponivel,
      alertasUrgentes: saldoDisponivel < 0 ? 1 : 0
    };
  }, [comparativo]);

  const handleAddTransacao = () => {
    // Implementar navegação para adicionar transação
    console.log("Adicionar transação");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Dashboard Financeiro
        </h1>
        <p className="text-muted-foreground">
          Controle inteligente das suas finanças
        </p>
      </div>

      {/* Layout Responsivo */}
      <div className="max-w-7xl mx-auto">
        {/* Desktop: 3 colunas */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          {/* Situação Atual - Full Width Top */}
          <div className="col-span-12">
            <StatusAtualCard
              saldoAtual={metricas.saldoAtual}
              comprometimentoMes={metricas.comprometimentoMes}
              saldoDisponivel={metricas.saldoDisponivel}
              alertasUrgentes={metricas.alertasUrgentes}
              onAddTransacao={handleAddTransacao}
              isLoading={isLoading}
            />
          </div>

          {/* Compromissos do Mês */}
          <div className="col-span-6">
            <CompromissosMensaisCard />
          </div>

          {/* Visão do Mês */}
          <div className="col-span-6">
            <ProjecaoMensalCard />
          </div>

          {/* Insights - Full Width Bottom */}
          <div className="col-span-12">
            <InsightsActionCard />
          </div>
        </div>

        {/* Mobile: Stack Vertical */}
        <div className="lg:hidden space-y-6">
          <StatusAtualCard
            saldoAtual={metricas.saldoAtual}
            comprometimentoMes={metricas.comprometimentoMes}
            saldoDisponivel={metricas.saldoDisponivel}
            alertasUrgentes={metricas.alertasUrgentes}
            onAddTransacao={handleAddTransacao}
            isLoading={isLoading}
          />
          
          <CompromissosMensaisCard />
          
          <ProjecaoMensalCard />
          
          <InsightsActionCard />
        </div>
      </div>
    </div>
  );
};