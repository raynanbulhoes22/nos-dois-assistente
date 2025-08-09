import { Badge } from "@/components/ui/badge";
import { FiltrosCalendario } from "./tipos";
import { Wallet, CreditCard, Calendar, TrendingUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarioFiltersProps {
  filtros: FiltrosCalendario;
  onChange: (filtros: FiltrosCalendario) => void;
}

export const CalendarioFilters = ({ filtros, onChange }: CalendarioFiltersProps) => {
  const toggleFiltro = (key: keyof FiltrosCalendario) => {
    onChange({
      ...filtros,
      [key]: !filtros[key],
    });
  };

  const filterItems = [
    {
      key: 'mostrarParcelas' as const,
      label: 'Parcelas',
      icon: Calendar,
      active: filtros.mostrarParcelas,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      key: 'mostrarVencimentosCartao' as const,
      label: 'Cartões',
      icon: CreditCard,
      active: filtros.mostrarVencimentosCartao,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      key: 'mostrarRenda' as const,
      label: 'Renda',
      icon: TrendingUp,
      active: filtros.mostrarRenda,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filtros de Visualização</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {filterItems.map(({ key, label, icon: Icon, active, color, bgColor, textColor, borderColor }) => (
          <button
            key={key}
            onClick={() => toggleFiltro(key)}
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
              active 
                ? `${bgColor} ${borderColor} shadow-md` 
                : "bg-muted/20 border-border hover:bg-muted/40"
            )}
          >
            {/* Gradient overlay when active */}
            {active && (
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-10",
                color
              )} />
            )}
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  active 
                    ? `${bgColor} ${textColor}` 
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <span className={cn(
                  "font-medium transition-colors",
                  active 
                    ? textColor 
                    : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {label}
                </span>
              </div>
              
              {/* Check indicator */}
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                active 
                  ? `${borderColor} ${bgColor} ${textColor}` 
                  : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
              )}>
                {active && <Check className="h-3 w-3" />}
              </div>
            </div>
            
            {/* Bottom accent line when active */}
            {active && (
              <div className={cn(
                "absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r",
                color
              )} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};