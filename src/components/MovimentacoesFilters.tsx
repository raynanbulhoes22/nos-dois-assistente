import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  CreditCard, 
  DollarSign, 
  ArrowUpDown,
  X,
  ChevronDown,
  ChevronUp
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
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);
  const [valueRangeOpen, setValueRangeOpen] = useState(false);

  const periodPresets = [
    { value: 'all', label: 'Todos os períodos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Últimos 7 dias' },
    { value: 'month', label: 'Este mês' },
    { value: 'year', label: 'Este ano' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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

  const handleValueRangeChange = (values: number[]) => {
    onFilterChange('valueRange', {
      min: values[0] === valueRange.min ? null : values[0],
      max: values[1] === valueRange.max ? null : values[1]
    });
  };

  const ActiveFiltersDisplay = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.search && (
        <Badge variant="secondary" className="gap-1">
          <Search className="h-3 w-3" />
          {filters.search}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onFilterChange('search', '')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {filters.period.preset !== 'all' && (
        <Badge variant="secondary" className="gap-1">
          <Calendar className="h-3 w-3" />
          {periodPresets.find(p => p.value === filters.period.preset)?.label}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onPeriodPresetChange('all')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {filters.categories.map(category => (
        <Badge key={category} variant="secondary" className="gap-1">
          <Tag className="h-3 w-3" />
          {category}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleCategoryToggle(category)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {filters.paymentMethods.map(method => (
        <Badge key={method} variant="secondary" className="gap-1">
          <CreditCard className="h-3 w-3" />
          {method}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handlePaymentMethodToggle(method)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {(filters.valueRange.min !== null || filters.valueRange.max !== null) && (
        <Badge variant="secondary" className="gap-1">
          <DollarSign className="h-3 w-3" />
          {filters.valueRange.min !== null ? formatCurrency(filters.valueRange.min) : 'Min'} - 
          {filters.valueRange.max !== null ? formatCurrency(filters.valueRange.max) : 'Max'}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onFilterChange('valueRange', { min: null, max: null })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <label className="text-sm font-medium">Período</label>
        </div>
        <Select value={filters.period.preset} onValueChange={onPeriodPresetChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodPresets.map(preset => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filters.period.preset === 'custom' && (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters.period.start}
              onChange={(e) => onFilterChange('period', { ...filters.period, start: e.target.value })}
              placeholder="Data inicial"
            />
            <Input
              type="date"
              value={filters.period.end}
              onChange={(e) => onFilterChange('period', { ...filters.period, end: e.target.value })}
              placeholder="Data final"
            />
          </div>
        )}
      </div>

      {/* Categories Filter */}
      <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium">Categorias</span>
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.categories.length}
                </Badge>
              )}
            </div>
            {categoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-3">
          <div className="max-h-48 overflow-y-auto space-y-2">
            {availableCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label 
                  htmlFor={`category-${category}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Payment Methods Filter */}
      <Collapsible open={paymentMethodsOpen} onOpenChange={setPaymentMethodsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Forma de Pagamento</span>
              {filters.paymentMethods.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.paymentMethods.length}
                </Badge>
              )}
            </div>
            {paymentMethodsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-3">
          <div className="max-h-48 overflow-y-auto space-y-2">
            {availablePaymentMethods.map(method => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`payment-${method}`}
                  checked={filters.paymentMethods.includes(method)}
                  onCheckedChange={() => handlePaymentMethodToggle(method)}
                />
                <label 
                  htmlFor={`payment-${method}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {method}
                </label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Value Range Filter */}
      <Collapsible open={valueRangeOpen} onOpenChange={setValueRangeOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Faixa de Valor</span>
              {(filters.valueRange.min !== null || filters.valueRange.max !== null) && (
                <Badge variant="secondary" className="text-xs">
                  Ativo
                </Badge>
              )}
            </div>
            {valueRangeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-3">
          <div className="px-3">
            <Slider
              value={[
                filters.valueRange.min ?? valueRange.min,
                filters.valueRange.max ?? valueRange.max
              ]}
              min={valueRange.min}
              max={valueRange.max}
              step={10}
              onValueChange={handleValueRangeChange}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(filters.valueRange.min ?? valueRange.min)}</span>
            <span>{formatCurrency(filters.valueRange.max ?? valueRange.max)}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sort Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          <label className="text-sm font-medium">Ordenação</label>
        </div>
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
              <SelectItem value="desc">Decrescente</SelectItem>
              <SelectItem value="asc">Crescente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="w-full"
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar transações..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mobile Filters - Sheet */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.categories.length + filters.paymentMethods.length + 
                     (filters.period.preset !== 'all' ? 1 : 0) +
                     (filters.valueRange.min !== null || filters.valueRange.max !== null ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6 overflow-y-auto">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm text-muted-foreground">
            {resultCount} resultado{resultCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Desktop Filters - Always Visible */}
      <div className="hidden sm:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {resultCount} resultado{resultCount !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FiltersContent />
          </CardContent>
        </Card>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && <ActiveFiltersDisplay />}
    </div>
  );
};