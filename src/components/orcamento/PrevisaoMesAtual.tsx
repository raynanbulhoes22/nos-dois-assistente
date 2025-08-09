import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { PrevisaoMensal } from "@/hooks/usePrevisibilidadeFinanceira";
import { cn } from "@/lib/utils";

interface PrevisaoMesAtualProps {
  previsao: PrevisaoMensal | undefined;
  getMesNome: (mes: number) => string;
}

export const PrevisaoMesAtual = ({ previsao, getMesNome }: PrevisaoMesAtualProps) => {
  if (!previsao) {
    return (
      <Card className="card-gradient">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando previsão...
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const getStatusIcon = () => {
    switch (previsao.status) {
      case 'positivo':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'deficit':
        return <TrendingDown className="h-5 w-5 text-error" />;
      case 'atencao':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (previsao.status) {
      case 'positivo':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">Positivo</Badge>;
      case 'deficit':
        return <Badge variant="destructive" className="bg-error/10 text-error border-error/20">Déficit</Badge>;
      case 'atencao':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Atenção</Badge>;
      default:
        return null;
    }
  };

  const getSaldoColor = () => {
    switch (previsao.status) {
      case 'positivo':
        return 'text-success';
      case 'deficit':
        return 'text-error';
      case 'atencao':
        return 'text-warning';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Previsão de {getMesNome(previsao.mes)} {previsao.ano}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-lg font-semibold text-success">
              {formatCurrency(previsao.receitas)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gastos Fixos</p>
            <p className="text-lg font-semibold text-muted-foreground">
              {formatCurrency(previsao.gastosFixos)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Saldo Projetado</p>
            <p className={cn("text-xl font-bold", getSaldoColor())}>
              {formatCurrency(previsao.saldoProjetado)}
            </p>
          </div>
        </div>
        
        {previsao.compromissos.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-2">
              Compromissos do mês ({previsao.compromissos.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {previsao.compromissos.slice(0, 4).map((compromisso) => (
                <div key={compromisso.id} className="flex justify-between items-center py-1">
                  <span className="text-sm truncate">{compromisso.nome}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(compromisso.valor)}
                  </span>
                </div>
              ))}
              {previsao.compromissos.length > 4 && (
                <div className="text-sm text-muted-foreground col-span-full">
                  +{previsao.compromissos.length - 4} outros compromissos
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};