import { useState } from "react";
import { Calendar, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format, subMonths, subDays, startOfYear } from "date-fns";
import { ReportFilters } from "@/hooks/useAdvancedReportsData";

interface ReportsFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
  availableCategories: string[];
  availablePaymentMethods: string[];
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
}

export const ReportsFilters = ({
  filters,
  onFiltersChange,
  availableCategories,
  availablePaymentMethods,
  onExportPDF,
  onExportExcel,
  onExportCSV
}: ReportsFiltersProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const presetRanges = [
    { label: "Último mês", getValue: () => ({ startDate: subMonths(new Date(), 1), endDate: new Date() }) },
    { label: "Últimos 3 meses", getValue: () => ({ startDate: subMonths(new Date(), 3), endDate: new Date() }) },
    { label: "Últimos 6 meses", getValue: () => ({ startDate: subMonths(new Date(), 6), endDate: new Date() }) },
    { label: "Último ano", getValue: () => ({ startDate: subMonths(new Date(), 12), endDate: new Date() }) },
    { label: "Ano atual", getValue: () => ({ startDate: startOfYear(new Date()), endDate: new Date() }) },
  ];

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getValue();
    onFiltersChange(range);
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    onFiltersChange({ categories: newCategories });
  };

  const handlePaymentMethodToggle = (method: string, checked: boolean) => {
    const newMethods = checked
      ? [...filters.paymentMethods, method]
      : filters.paymentMethods.filter(m => m !== method);
    onFiltersChange({ paymentMethods: newMethods });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      paymentMethods: [],
      includeFixed: true,
      includeInstallments: true,
      includeCards: true
    });
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.paymentMethods.length + 
    (!filters.includeFixed ? 1 : 0) + 
    (!filters.includeInstallments ? 1 : 0) + 
    (!filters.includeCards ? 1 : 0);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Configurações
          </CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={onExportPDF}
                  >
                    Relatório PDF
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={onExportExcel}
                  >
                    Planilha Excel
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={onExportCSV}
                  >
                    Dados CSV
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Period Selection */}
          <div className="space-y-2">
            <Label>Período de Análise</Label>
            <div className="flex flex-wrap gap-2">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Personalizado
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Data Inicial</Label>
                      <CalendarComponent
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => date && onFiltersChange({ startDate: date })}
                        disabled={(date) => date > new Date()}
                        className="rounded-md border"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Data Final</Label>
                      <CalendarComponent
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => date && onFiltersChange({ endDate: date })}
                        disabled={(date) => date > new Date() || date < filters.startDate}
                        className="rounded-md border"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setShowDatePicker(false)}
                      className="w-full"
                    >
                      Aplicar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(filters.startDate, "dd/MM/yyyy")} até {format(filters.endDate, "dd/MM/yyyy")}
            </div>
          </div>

          {/* Grouping */}
          <div className="space-y-2">
            <Label>Agrupamento</Label>
            <Select
              value={filters.groupBy}
              onValueChange={(value: 'week' | 'month' | 'quarter') => 
                onFiltersChange({ groupBy: value })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semanal</SelectItem>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="p-0 h-auto font-normal"
            >
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              {/* Categories Filter */}
              {availableCategories.length > 0 && (
                <div className="space-y-2">
                  <Label>Categorias</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => 
                            handleCategoryToggle(category, !!checked)
                          }
                        />
                        <Label 
                          htmlFor={`category-${category}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods Filter */}
              {availablePaymentMethods.length > 0 && (
                <div className="space-y-2">
                  <Label>Formas de Pagamento</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {availablePaymentMethods.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={`method-${method}`}
                          checked={filters.paymentMethods.includes(method)}
                          onCheckedChange={(checked) => 
                            handlePaymentMethodToggle(method, !!checked)
                          }
                        />
                        <Label 
                          htmlFor={`method-${method}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {method}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Include/Exclude Options */}
              <div className="space-y-2">
                <Label>Incluir nos Relatórios</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-fixed"
                      checked={filters.includeFixed}
                      onCheckedChange={(checked) => 
                        onFiltersChange({ includeFixed: !!checked })
                      }
                    />
                    <Label htmlFor="include-fixed" className="text-sm font-normal">
                      Gastos Fixos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-installments"
                      checked={filters.includeInstallments}
                      onCheckedChange={(checked) => 
                        onFiltersChange({ includeInstallments: !!checked })
                      }
                    />
                    <Label htmlFor="include-installments" className="text-sm font-normal">
                      Contas Parceladas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-cards"
                      checked={filters.includeCards}
                      onCheckedChange={(checked) => 
                        onFiltersChange({ includeCards: !!checked })
                      }
                    />
                    <Label htmlFor="include-cards" className="text-sm font-normal">
                      Transações de Cartão
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};