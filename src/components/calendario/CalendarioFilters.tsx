import { CreditCard, Calendar, TrendingUp } from "lucide-react";
import { FiltrosCalendario } from "./tipos";

interface CalendarioFiltersProps {
  filtros: FiltrosCalendario;
  onChange: (filtros: FiltrosCalendario) => void;
}

export const CalendarioFilters = ({ filtros, onChange }: CalendarioFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <span className="text-xs sm:text-sm text-muted-foreground">Mostrar:</span>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <label className="flex items-center gap-1 text-xs sm:text-sm cursor-pointer hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={filtros.mostrarParcelas}
            onChange={(e) => onChange({...filtros, mostrarParcelas: e.target.checked})}
            className="rounded w-3 h-3 sm:w-3.5 sm:h-3.5"
          />
          <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
          <span className="hidden sm:inline">Parcelas</span>
        </label>
        
        <label className="flex items-center gap-1 text-xs sm:text-sm cursor-pointer hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={filtros.mostrarVencimentosCartao}
            onChange={(e) => onChange({...filtros, mostrarVencimentosCartao: e.target.checked})}
            className="rounded w-3 h-3 sm:w-3.5 sm:h-3.5"
          />
          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-orange-500" />
          <span className="hidden sm:inline">Cartões</span>
        </label>
        
        <label className="flex items-center gap-1 text-xs sm:text-sm cursor-pointer hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={filtros.mostrarRenda}
            onChange={(e) => onChange({...filtros, mostrarRenda: e.target.checked})}
            className="rounded w-3 h-3 sm:w-3.5 sm:h-3.5"
          />
          <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
          <span className="hidden sm:inline">Renda</span>
        </label>
      </div>
    </div>
  );
};