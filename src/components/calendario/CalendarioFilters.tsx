import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiltrosCalendario } from "./tipos";
import { Wallet, CreditCard, Calendar, TrendingUp } from "lucide-react";

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
      key: 'mostrarMovimentacoes' as const,
      label: 'Movimentações',
      icon: Wallet,
      active: filtros.mostrarMovimentacoes,
      color: 'default',
    },
    {
      key: 'mostrarParcelas' as const,
      label: 'Parcelas',
      icon: Calendar,
      active: filtros.mostrarParcelas,
      color: 'secondary',
    },
    {
      key: 'mostrarVencimentosCartao' as const,
      label: 'Cartões',
      icon: CreditCard,
      active: filtros.mostrarVencimentosCartao,
      color: 'destructive',
    },
    {
      key: 'mostrarRenda' as const,
      label: 'Renda',
      icon: TrendingUp,
      active: filtros.mostrarRenda,
      color: 'success',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-card rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
      {filterItems.map(({ key, label, icon: Icon, active, color }) => (
        <Button
          key={key}
          variant={active ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFiltro(key)}
          className={`transition-all duration-200 ${
            active 
              ? "shadow-md scale-105" 
              : "opacity-60 hover:opacity-100"
          }`}
        >
          <Icon className="h-4 w-4 mr-1" />
          {label}
          {active && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              ✓
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};