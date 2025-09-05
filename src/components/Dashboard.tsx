import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye, Settings, TrendingUp } from "lucide-react";

// New smart dashboard hook
import { useSmartDashboard } from "@/hooks/useSmartDashboard";

// New dashboard sections
import { FinancialStatusSection } from "./dashboard/FinancialStatusSection";
import { BehavioralInsightsSection } from "./dashboard/BehavioralInsightsSection";
import { AchievementsSection } from "./dashboard/AchievementsSection";
import { LongTermProjectionSection } from "./dashboard/LongTermProjectionSection";

// Keep essential components
import { WelcomeModal } from "./WelcomeModal";
import { PaymentAlertsPanel } from "./dashboard/PaymentAlertsPanel";
import { usePaymentAlerts } from "@/hooks/usePaymentAlerts";
import { QuickTip } from "./help/QuickTip";
import { TermsUpdateAlert } from "./TermsUpdateAlert";
import { TermsUpdateModal } from "./TermsUpdateModal";
import { useTermsCheck } from "@/hooks/useTermsCheck";
interface User {
  id: string;
  email?: string;
}
export const Dashboard = ({
  user
}: {
  user: User;
}) => {
  const [showBalance, setShowBalance] = useState(true);  
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Use the new smart dashboard hook
  const dashboardData = useSmartDashboard();
  
  // Keep essential hooks
  const { alerts, loading: alertsLoading, checkPaymentAlerts, dismissAlert } = usePaymentAlerts();
  const { needsAcceptance, userVersion, currentVersion, loading: termsLoading, acceptNewTerms } = useTermsCheck();

  // Simple loading state check
  const isLoading = dashboardData.isLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-16 bg-muted rounded-lg"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-80 bg-muted rounded-lg"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Simplified Header - Focus on Overview */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Visão Geral
              </h1>
              <p className="text-sm text-muted-foreground">
                Insights inteligentes sobre suas finanças
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="h-8 px-3"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - New Structure */}
      <div className="p-4 sm:px-6 pb-6">
        <div className="space-y-6">
          {/* Quick Tip and Alerts */}
          <QuickTip className="mb-4" />
          
          {needsAcceptance && !termsLoading && (
            <TermsUpdateAlert
              onViewTerms={() => setShowTermsModal(true)}
              userVersion={userVersion}
              currentVersion={currentVersion}
            />
          )}

          {alerts.length > 0 && (
            <PaymentAlertsPanel
              alerts={alerts}
              loading={alertsLoading}
              onDismiss={dismissAlert}
              onRefresh={checkPaymentAlerts}
            />
          )}

          {/* 1. Status Financeiro Atual */}
          <FinancialStatusSection
            saldoTotal={dashboardData.saldoTotal}
            saldoInicial={dashboardData.saldoInicial}
            saldoMovimentacoes={dashboardData.saldoMovimentacoes}
            rendaMes={dashboardData.rendaMes}
            gastosMes={dashboardData.gastosMes}
            saldoEsperado={dashboardData.saldoEsperado}
            saudeFinanceira={dashboardData.saudeFinanceira}
            showBalance={showBalance}
            onToggleBalance={() => setShowBalance(!showBalance)}
          />

          {/* 2. Central de Insights Comportamentais */}
          <BehavioralInsightsSection
            insights={dashboardData.insights}
            categoriasMaisGastas={dashboardData.categoriasMaisGastas}
            padraoGastos={dashboardData.padraoGastos}
          />

          {/* 3 & 4. Conquistas e Projeção em Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            <AchievementsSection
              conquistas={dashboardData.conquistas}
            />
            
            <LongTermProjectionSection
              projecaoTrimestre={dashboardData.projecaoTrimestre}
              saldoAtual={dashboardData.saldoTotal}
              rendaMensal={dashboardData.rendaMes}
              gastosMedios={dashboardData.gastosMes}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <WelcomeModal user={user} />
      
      <TermsUpdateModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={acceptNewTerms}
        userVersion={userVersion}
        currentVersion={currentVersion}
      />
    </div>
  );
};