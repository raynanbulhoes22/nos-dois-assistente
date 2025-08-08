import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  CreditCard, 
  DollarSign, 
  ArrowUpDown,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MovimentacoesFilters as MovimentacoesFiltersType } from '@/hooks/useMovimentacoesFilters';

interface MovimentacoesFiltersProps {
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

export const MovimentacoesFilters = ({
  filters,
  availableCategories,
  availablePaymentMethods,
  valueRange,
  onFilterChange,
  onPeriodPresetChange,
  onClearFilters,
  hasActiveFilters,
  resultCount
}: MovimentacoesFiltersProps) => {
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

  const ActiveFiltersChips = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
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
          <Badge key={category} variant="secondary" className="text-xs gap-1">
            {category}
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-background rounded" 
              onClick={() => handleCategoryToggle(category)}
            />
          </Badge>
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
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="flex gap-2 items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Quick Period Filter */}
        <Select value={filters.period.preset} onValueChange={onPeriodPresetChange}>
          <SelectTrigger className="w-24 h-9 text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodPresets.map(preset => (
              <SelectItem key={preset.value} value={preset.value} className="text-xs">
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters - Desktop */}
        <div className="hidden md:flex gap-2">
          {/* Categories Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1">
                <Tag className="h-3 w-3" />
                Categoria
                {filters.categories.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {filters.categories.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <div className="font-medium text-sm">Categorias</div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availableCategories.slice(0, 10).map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                        className="h-3 w-3"
                      />
                      <label 
                        htmlFor={`cat-${category}`}
                        className="text-xs cursor-pointer flex-1"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Payment Methods Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1">
                <CreditCard className="h-3 w-3" />
                Pagamento
                {filters.paymentMethods.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {filters.paymentMethods.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-2">
                <div className="font-medium text-sm">Formas de Pagamento</div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availablePaymentMethods.map(method => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pay-${method}`}
                        checked={filters.paymentMethods.includes(method)}
                        onCheckedChange={() => handlePaymentMethodToggle(method)}
                        className="h-3 w-3"
                      />
                      <label 
                        htmlFor={`pay-${method}`}
                        className="text-xs cursor-pointer flex-1"
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <Select value={filters.sortBy} onValueChange={(value) => onFilterChange('sortBy', value as any)}>
            <SelectTrigger className="w-24 h-9 text-xs">
              <ArrowUpDown className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data" className="text-xs">Data</SelectItem>
              <SelectItem value="valor" className="text-xs">Valor</SelectItem>
              <SelectItem value="nome" className="text-xs">Nome</SelectItem>
              <SelectItem value="categoria" className="text-xs">Categoria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Advanced Filters */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-2">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                    {filters.categories.length + filters.paymentMethods.length + 
                     (filters.period.preset !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-lg">Filtros Avançados</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
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
                          className="text-sm cursor-pointer flex-1"
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
                      <SelectContent>
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
                      <SelectContent>
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
                    className="w-full"
                  >
                    Limpar Todos os Filtros
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Count */}
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'item' : 'itens'}
        </div>
      </div>

      {/* Active Filters Chips */}
      <ActiveFiltersChips />
    </div>
  );
};