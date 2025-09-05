import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { SmartInsight } from "@/hooks/useSmartDashboard";

interface BehavioralInsightsSectionProps {
  insights: SmartInsight[];
  categoriasMaisGastas: Array<{ categoria: string; valor: number; percentual: number }>;
  padraoGastos: {
    diaMaisGasto: string;
    hoarioMaisGasto: string;
    estabelecimentoFavorito: string;
  };
}

export const BehavioralInsightsSection = ({
  insights,
  categoriasMaisGastas,
  padraoGastos
}: BehavioralInsightsSectionProps) => {
  const getInsightIcon = (tipo: SmartInsight['tipo']) => {
    switch (tipo) {
      case 'critico': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'alerta': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'sucesso': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightBorderColor = (tipo: SmartInsight['tipo']) => {
    switch (tipo) {
      case 'critico': return 'border-red-200 bg-red-50';
      case 'alerta': return 'border-yellow-200 bg-yellow-50';
      case 'sucesso': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getConfidenceColor = (confianca: SmartInsight['confianca']) => {
    switch (confianca) {
      case 'alta': return 'text-green-600';
      case 'media': return 'text-yellow-600';
      case 'baixa': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Insights Comportamentais
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise inteligente do seu comportamento financeiro
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Insights Principais */}
        {insights.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights Personalizados
            </h4>
            
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${getInsightBorderColor(insight.tipo)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.tipo)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-medium text-sm">{insight.titulo}</h5>
                      <Badge variant="outline" className={`text-xs ${getConfidenceColor(insight.confianca)}`}>
                        {insight.confianca}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {insight.mensagem}
                    </p>
                    
                    {insight.impacto && (
                      <p className="text-xs text-muted-foreground">
                        <strong>Impacto:</strong> {insight.impacto}
                      </p>
                    )}
                    
                    {insight.acao && (
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        {insight.acao}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Coletando dados para gerar insights...</p>
          </div>
        )}

        {/* Padrões de Comportamento */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Padrões Identificados
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Dia de Maior Gasto</p>
              <p className="font-medium text-sm">{padraoGastos.diaMaisGasto || 'Analisando...'}</p>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Horário Preferido</p>
              <p className="font-medium text-sm">{padraoGastos.hoarioMaisGasto || 'Analisando...'}</p>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Local Favorito</p>
              <p className="font-medium text-sm">{padraoGastos.estabelecimentoFavorito || 'Analisando...'}</p>
            </div>
          </div>
        </div>

        {/* Top Categorias */}
        {categoriasMaisGastas.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Onde Você Mais Gasta</h4>
            
            <div className="space-y-2">
              {categoriasMaisGastas.slice(0, 4).map((categoria, index) => (
                <div key={categoria.categoria} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{categoria.categoria}</span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(categoria.valor)}</p>
                    <p className="text-xs text-muted-foreground">{categoria.percentual.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};