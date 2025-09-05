import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { LongTermProjection } from "@/hooks/useSmartDashboard";

interface LongTermProjectionSectionProps {
  projecaoTrimestre: LongTermProjection[];
  saldoAtual: number;
  rendaMensal: number;
  gastosMedios: number;
}

export const LongTermProjectionSection = ({
  projecaoTrimestre,
  saldoAtual,
  rendaMensal,
  gastosMedios
}: LongTermProjectionSectionProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[month - 1];
  };

  // Simular projeção se não houver dados
  const projecaoSimulada = [];
  const hoje = new Date();
  
  for (let i = 1; i <= 3; i++) {
    const dataProjecao = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const saldoProjetado = saldoAtual + ((rendaMensal - gastosMedios) * i);
    
    projecaoSimulada.push({
      mes: dataProjecao.getMonth() + 1,
      ano: dataProjecao.getFullYear(),
      saldoProjetado,
      rendaEsperada: rendaMensal,
      gastosEsperados: gastosMedios,
      confianca: i === 1 ? 'alta' : i === 2 ? 'media' : 'baixa' as 'alta' | 'media' | 'baixa'
    });
  }

  const projecoes = projecaoTrimestre.length > 0 ? projecaoTrimestre : projecaoSimulada;
  
  const getConfidenceColor = (confianca: 'alta' | 'media' | 'baixa') => {
    switch (confianca) {
      case 'alta': return 'text-green-600 bg-green-50 border-green-200';
      case 'media': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'baixa': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (saldoAtual: number, saldoProjetado: number) => {
    if (saldoProjetado > saldoAtual) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (saldoProjetado < saldoAtual) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <div className="h-4 w-4" />;
  };

  // Calcular impacto das decisões
  const impactoPositivo = (rendaMensal - gastosMedios) * 3;
  const cenarioOtimista = saldoAtual + (impactoPositivo * 1.2);
  const cenarioPessimista = saldoAtual + (impactoPositivo * 0.8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Visão Estratégica
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Projeção e impacto das suas decisões financeiras
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Projeção dos Próximos 3 Meses */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Projeção - Próximos 3 Meses
          </h4>
          
          <div className="space-y-3">
            {projecoes.map((projecao, index) => (
              <div
                key={`${projecao.mes}-${projecao.ano}`}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {getMonthName(projecao.mes)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {projecao.ano}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {formatCurrency(projecao.saldoProjetado)}
                      </span>
                      {getTrendIcon(saldoAtual, projecao.saldoProjetado)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Esperado: {formatCurrency(projecao.rendaEsperada - projecao.gastosEsperados)}/mês
                    </p>
                  </div>
                </div>
                
                <Badge variant="outline" className={`text-xs ${getConfidenceColor(projecao.confianca)}`}>
                  {projecao.confianca}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Cenários */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Cenários (3 meses)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">OTIMISTA</span>
              </div>
              <p className="font-bold text-green-700">
                {formatCurrency(cenarioOtimista)}
              </p>
              <p className="text-xs text-green-600">+20% economia</p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">ATUAL</span>
              </div>
              <p className="font-bold text-blue-700">
                {formatCurrency(saldoAtual + impactoPositivo)}
              </p>
              <p className="text-xs text-blue-600">Ritmo atual</p>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">PESSIMISTA</span>
              </div>
              <p className="font-bold text-orange-700">
                {formatCurrency(cenarioPessimista)}
              </p>
              <p className="text-xs text-orange-600">-20% economia</p>
            </div>
          </div>
        </div>

        {/* Sugestões Estratégicas */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h5 className="font-medium text-sm mb-2 text-primary">
            💡 Sugestão Estratégica
          </h5>
          
          {impactoPositivo > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Se continuar assim:</strong> Em 3 meses você terá {formatCurrency(saldoAtual + impactoPositivo)} a mais.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Para acelerar:</strong> Reduza gastos em 10% e alcance {formatCurrency(cenarioOtimista)}.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Atenção:</strong> No ritmo atual, seu saldo pode diminuir {formatCurrency(Math.abs(impactoPositivo))} em 3 meses.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Recomendação:</strong> Revise seus gastos ou aumente sua renda para reverter a tendência.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};