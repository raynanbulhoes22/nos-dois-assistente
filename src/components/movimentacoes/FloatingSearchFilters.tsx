import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  SlidersHorizontal,
  Calendar, 
  X,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryColorClass } from '@/lib/categoryColors';
import type { MovimentacoesFilters as MovimentacoesFiltersType } from '@/hooks/useMovimentacoesFilters';

interface FloatingSearchFiltersProps {
  filters: MovimentacoesFiltersType;
  availableCategories: string[];
  availablePaymentMethods: string[];
  valueRange: { min: number; max: number };
  onFilterChange: <K extends keyof MovimentacoesFiltersType>(key: K, value: MovimentacoesFiltersType[K]) => void;
  onPeriodPresetChange: (preset: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

export const FloatingSearchFilters = ({
  filters,
  availableCategories,
  availablePaymentMethods,
  valueRange,
  onFilterChange,
  onPeriodPresetChange,
  onClearFilters,
  hasActiveFilters,
  resultCount
}: FloatingSearchFiltersProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const periodPresets = [
    { value: 'all', label: 'Todos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: '7 dias' },
    { value: 'month', label: 'Mês' },
    { value: 'year', label: 'Ano' }
  ];

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange('categories', newCategories);
  };

  const handlePaymentMethodToggle = (method: string) => {
    const newMethods = filters.paymentMethods.includes(method)
      ? filters.paymentMethods.filter(m => m !== method)
      : [...filters.paymentMethods, method];
    onFilterChange('paymentMethods', newMethods);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.period.preset !== 'all') count++;
    if (filters.categories.length > 0) count++;
    if (filters.paymentMethods.length > 0) count++;
    return count;
  };

  const ActiveFiltersChips = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-3 px-4">
        {filters.search && (
          <Badge variant="secondary" className="text-xs gap-1">
            "{filters.search}"
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-background rounded" 
              onClick={() => onFilterChange('search', '')}
            />
          </Badge>
        )}
        {filters.period.preset !== 'all' && (
          <Badge variant="secondary" className="text-xs gap-1">
            {periodPresets.find(p => p.value === filters.period.preset)?.label}
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-background rounded" 
              onClick={() => onPeriodPresetChange('all')}
            />
          </Badge>
        )}
        {filters.categories.slice(0, 2).map(category => (
          <span
            key={category}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border",
              getCategoryColorClass(category)
            )}
          >
            {category}
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-background/20 rounded" 
              onClick={() => handleCategoryToggle(category)}
            />
          </span>
        ))}
        {filters.categories.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            +{filters.categories.length - 2} categorias
          </Badge>
        )}
        {filters.paymentMethods.slice(0, 1).map(method => (
          <Badge key={method} variant="secondary" className="text-xs gap-1">
            {method}
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-background rounded" 
              onClick={() => handlePaymentMethodToggle(method)}
            />
          </Badge>
        ))}
        {filters.paymentMethods.length > 1 && (
          <Badge variant="secondary" className="text-xs">
            +{filters.paymentMethods.length - 1} pagamentos
          </Badge>
        )}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="h-6 px-2 text-xs hover:bg-destructive hover:text-destructive-foreground"
          >
            Limpar
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3">
        {/* Search Button */}
        <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-background border-2 hover:bg-muted"
            >
              <Search className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 flex flex-col max-h-screen">
            <SheetHeader className="flex-shrink-0">
              <SheetTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto mt-6 space-y-6 pr-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, categoria, estabelecimento..."
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              
              {/* Quick Period Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Período</Label>
                <Select value={filters.period.preset} onValueChange={onPeriodPresetChange}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {periodPresets.map(preset => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Transaction Type Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de Transação</Label>
                <Select 
                  value={filters.transactionType} 
                  onValueChange={(value) => onFilterChange('transactionType', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="entradas">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Entradas
                      </div>
                    </SelectItem>
                    <SelectItem value="saidas">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Saídas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Value Range Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Faixa de Valores</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Mínimo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={filters.valueRange.min || ''}
                        onChange={(e) => onFilterChange('valueRange', {
                          ...filters.valueRange,
                          min: e.target.value ? Number(e.target.value) : undefined
                        })}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Máximo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="999,99"
                        value={filters.valueRange.max || ''}
                        onChange={(e) => onFilterChange('valueRange', {
                          ...filters.valueRange,
                          max: e.target.value ? Number(e.target.value) : undefined
                        })}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Categories Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Categorias</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {availableCategories.slice(0, 5).map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`search-cat-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label 
                        htmlFor={`search-cat-${category}`}
                        className={cn(
                          "text-sm cursor-pointer flex-1 px-2 py-1 rounded-md border font-medium text-xs",
                          getCategoryColorClass(category)
                        )}
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                  {availableCategories.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{availableCategories.length - 5} categorias nos filtros avançados
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Formas de Pagamento</Label>
                <div className="max-h-24 overflow-y-auto space-y-2">
                  {availablePaymentMethods.slice(0, 3).map(method => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`search-pay-${method}`}
                        checked={filters.paymentMethods.includes(method)}
                        onCheckedChange={() => handlePaymentMethodToggle(method)}
                      />
                      <label 
                        htmlFor={`search-pay-${method}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                  {availablePaymentMethods.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{availablePaymentMethods.length - 3} métodos nos filtros avançados
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                {resultCount} {resultCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </div>

              {(filters.search || hasActiveFilters) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onFilterChange('search', '');
                    onClearFilters();
                  }}
                  className="w-full mb-4"
                >
                  Limpar Tudo
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Advanced Filters Button */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-background border-2 hover:bg-muted relative"
            >
              <SlidersHorizontal className="h-5 w-5" />
              {getActiveFiltersCount() > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs rounded-full flex items-center justify-center bg-primary text-primary-foreground"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 flex flex-col max-h-screen">
            <SheetHeader className="flex-shrink-0">
              <SheetTitle className="text-lg flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filtros Avançados
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto mt-6 space-y-6 pr-2">
              {/* Categories */}
              <div className="space-y-3">
                <div className="font-medium">Categorias</div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {availableCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-cat-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label 
                        htmlFor={`mobile-cat-${category}`}
                        className={cn(
                          "text-sm cursor-pointer flex-1 px-2 py-1 rounded-md border font-medium",
                          getCategoryColorClass(category)
                        )}
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <div className="font-medium">Formas de Pagamento</div>
                <div className="space-y-2">
                  {availablePaymentMethods.map(method => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-pay-${method}`}
                        checked={filters.paymentMethods.includes(method)}
                        onCheckedChange={() => handlePaymentMethodToggle(method)}
                      />
                      <label 
                        htmlFor={`mobile-pay-${method}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-3">
                <div className="font-medium">Ordenação</div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filters.sortBy} onValueChange={(value) => onFilterChange('sortBy', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="valor">Valor</SelectItem>
                      <SelectItem value="nome">Nome</SelectItem>
                      <SelectItem value="categoria">Categoria</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.sortOrder} onValueChange={(value) => onFilterChange('sortOrder', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="desc">Mais recente</SelectItem>
                      <SelectItem value="asc">Mais antigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={onClearFilters}
                  className="w-full mb-4"
                >
                  Limpar Todos os Filtros
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Chips */}
      <ActiveFiltersChips />
    </div>
  );
};