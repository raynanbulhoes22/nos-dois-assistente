import { AlertTriangle, CheckCircle, Info, AlertCircle, Lightbulb, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SmartInsight } from "@/hooks/useAdvancedReportsData";

interface SmartInsightsPanelProps {
  insights: SmartInsight[];
  isLoading?: boolean;
}

export const SmartInsightsPanel = ({ insights, isLoading }: SmartInsightsPanelProps) => {
  const getInsightIcon = (type: SmartInsight['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getInsightVariant = (type: SmartInsight['type']) => {
    switch (type) {
      case 'critical':
        return 'destructive' as const;
      case 'warning':
        return 'outline' as const;
      case 'success':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getInsightBorderColor = (type: SmartInsight['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50/50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'success':
        return 'border-green-200 bg-green-50/50';
      default:
        return 'border-blue-200 bg-blue-50/50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Não há insights disponíveis para o período selecionado.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Adicione mais transações para gerar análises personalizadas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group insights by type
  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) {
      acc[insight.type] = [];
    }
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<SmartInsight['type'], SmartInsight[]>);

  const insightTypeOrder: SmartInsight['type'][] = ['critical', 'warning', 'info', 'success'];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights Inteligentes
          <Badge variant="secondary" className="ml-auto">
            {insights.length} {insights.length === 1 ? 'insight' : 'insights'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insightTypeOrder.map(type => 
            groupedInsights[type]?.map((insight, index) => (
              <Alert key={`${type}-${index}`} className={`${getInsightBorderColor(insight.type)} border-l-4`}>
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge variant={getInsightVariant(insight.type)} className="text-xs">
                        {insight.type === 'critical' ? 'Crítico' : 
                         insight.type === 'warning' ? 'Atenção' :
                         insight.type === 'success' ? 'Sucesso' : 'Info'}
                      </Badge>
                      <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confiança
                      </span>
                    </div>
                    <AlertDescription className="text-sm mb-3">
                      {insight.description}
                    </AlertDescription>
                    
                    {insight.impact && (
                      <div className="text-xs text-muted-foreground mb-2">
                        <strong>Impacto:</strong> {insight.impact}
                      </div>
                    )}
                    
                    {insight.actionable && insight.action && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {insight.action}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))
          )}
        </div>
        
        {insights.length > 5 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>
                Os insights são gerados automaticamente com base nos seus padrões financeiros. 
                Quanto mais dados você tiver, mais precisas serão as análises.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};