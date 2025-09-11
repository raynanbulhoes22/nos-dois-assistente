import { cn } from "@/lib/utils";
import { safeNumber } from "@/lib/financial-utils";

interface TimelineItem {
  mes: number;
  ano: number;
  status: string; // 'excelente' | 'positivo' | 'critico' | 'deficit' | 'sem-dados' | 'quase_positivo' | 'quase_negativo'
  saldoProjetado: number;
  receitas: number;
}

interface MiniTimelineProps {
  previsoes: TimelineItem[];
  currentMonth: number;
  currentYear: number;
  onMonthSelect: (mes: number, ano: number) => void;
  getMesNome: (mes: number) => string;
}

export const MiniTimeline = ({
  previsoes,
  currentMonth,
  currentYear,
  onMonthSelect,
  getMesNome
}: MiniTimelineProps) => {
  const getStatusColor = (status: string, isSelected: boolean) => {
    const baseClasses = "w-3 h-3 rounded-full transition-all duration-200 cursor-pointer hover:scale-125 border-2";
    
    if (isSelected) {
      switch (status) {
        case 'excelente':
          return cn(baseClasses, "bg-success border-success shadow-lg shadow-success/30 animate-pulse-glow");
        case 'positivo':
          return cn(baseClasses, "bg-warning border-warning shadow-lg shadow-warning/30");
        case 'critico':
          return cn(baseClasses, "bg-critical border-critical shadow-lg shadow-critical/30");
        case 'deficit':
          return cn(baseClasses, "bg-error border-error shadow-lg shadow-error/30");
        case 'quase_positivo':
          return cn(baseClasses, "bg-primary border-primary shadow-lg shadow-primary/30");
        case 'quase_negativo':
          return cn(baseClasses, "bg-critical/80 border-critical shadow-lg shadow-critical/30");
        case 'sem-dados':
          return cn(baseClasses, "bg-background border-border shadow-lg shadow-border/30");
        default:
          return cn(baseClasses, "bg-muted border-border shadow-lg shadow-muted/30");
      }
    }
    
    switch (status) {
      case 'excelente':
        return cn(baseClasses, "bg-success/30 border-success/50 hover:bg-success/50 hover:shadow-success/20");
      case 'positivo':
        return cn(baseClasses, "bg-warning/30 border-warning/50 hover:bg-warning/50 hover:shadow-warning/20");
      case 'critico':
        return cn(baseClasses, "bg-critical/30 border-critical/50 hover:bg-critical/50 hover:shadow-critical/20");
      case 'deficit':
        return cn(baseClasses, "bg-error/30 border-error/50 hover:bg-error/50 hover:shadow-error/20");
      case 'sem-dados':
        return cn(baseClasses, "bg-background border-border hover:bg-muted");
      case 'quase_positivo':
        return cn(baseClasses, "bg-primary/40 border-primary/60 hover:bg-primary/60");
      case 'quase_negativo':
        return cn(baseClasses, "bg-critical/40 border-critical/60 hover:bg-critical/60");
      default:
        return cn(baseClasses, "bg-muted border-border hover:bg-muted/70");
    }
  };

  if (!previsoes.length) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="flex gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index}
              className="w-3 h-3 rounded-full bg-muted border-2 border-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-4">
      <div className="flex gap-2 items-center">
        {previsoes.map((previsao, index) => {
          const isSelected = previsao.mes === currentMonth && previsao.ano === currentYear;
          
          return (
            <div
              key={`${previsao.mes}-${previsao.ano}`}
              className="relative group"
              onClick={() => onMonthSelect(previsao.mes, previsao.ano)}
            >
              <div className={getStatusColor(previsao.status, isSelected)} />
              
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-xs font-medium text-foreground mb-1">
                    {getMesNome(previsao.mes)} {previsao.ano}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Saldo:</span>
                      <span className={cn(
                        "font-medium",
                        previsao.status === 'excelente' ? 'text-success' :
                        previsao.status === 'positivo' ? 'text-warning' :
                        previsao.status === 'critico' ? 'text-critical' :
                        previsao.status === 'quase_positivo' ? 'text-primary' :
                        previsao.status === 'quase_negativo' ? 'text-critical' :
                        previsao.status === 'deficit' ? 'text-error' : 'text-neutral'
                      )}>
                        {safeNumber(previsao.saldoProjetado, 0).toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={cn(
                        "font-medium",
                        previsao.status === 'excelente' ? 'text-success' :
                        previsao.status === 'positivo' ? 'text-warning' :
                        previsao.status === 'critico' ? 'text-critical' :
                        previsao.status === 'quase_positivo' ? 'text-primary' :
                        previsao.status === 'quase_negativo' ? 'text-critical' :
                        previsao.status === 'deficit' ? 'text-error' : 'text-neutral'
                      )}>
                        {previsao.status === 'excelente' ? '🟢 Excelente' :
                         previsao.status === 'positivo' ? '🟡 Bom' :
                         previsao.status === 'critico' ? '🟠 Crítico' :
                         previsao.status === 'quase_positivo' ? '🔵 Quase positivo' :
                         previsao.status === 'quase_negativo' ? '🟠 Quase negativo' :
                         previsao.status === 'deficit' ? '🔴 Déficit' : '⚪ Sem dados'}
                      </span>
                    </div>
                     {safeNumber(previsao.receitas, 0) > 0 && (
                       <div className="flex justify-between gap-3">
                         <span className="text-muted-foreground">Disponível:</span>
                         <span className="font-medium text-xs">
                           {((safeNumber(previsao.saldoProjetado, 0) / safeNumber(previsao.receitas, 1)) * 100).toFixed(1)}% da renda
                         </span>
                       </div>
                     )}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};