import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Filter,
  X,
  Search,
  DollarSign,
  Tag,
  CreditCard
} from "lucide-react";

interface DashboardFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

interface FilterState {
  searchTerm: string;
  category: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
  transactionType: string;
}

export const DashboardFilters = ({ isOpen, onClose, onApplyFilters }: DashboardFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    category: "",
    paymentMethod: "",
    minAmount: "",
    maxAmount: "",
    transactionType: ""
  });

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      searchTerm: "",
      category: "",
      paymentMethod: "",
      minAmount: "",
      maxAmount: "",
      transactionType: ""
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <Card className="border shadow-lg bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Filtros Avançados</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Buscar transação</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Nome, descrição..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Categoria</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="alimentacao">Alimentação</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="moradia">Moradia</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="lazer">Lazer</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Forma de Pagamento</Label>
            <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="debito">Cartão de Débito</SelectItem>
                <SelectItem value="credito">Cartão de Crédito</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Valor</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Mín"
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Máx"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="pl-7 h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Transaction Type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Tipo de Transação</Label>
          <Select value={filters.transactionType} onValueChange={(value) => setFilters(prev => ({ ...prev, transactionType: value }))}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="entrada">Receitas</SelectItem>
              <SelectItem value="saida">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={handleApplyFilters} className="flex-1 h-8 text-xs">
            Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={handleClearFilters} className="h-8 text-xs">
            Limpar
          </Button>
        </div>

        {/* Active Filters Display */}
        {(filters.searchTerm || filters.category || filters.paymentMethod || filters.minAmount || filters.maxAmount || filters.transactionType) && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Filtros Ativos:</Label>
            <div className="flex flex-wrap gap-1">
              {filters.searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Busca: {filters.searchTerm}
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="text-xs">
                  {filters.category}
                </Badge>
              )}
              {filters.paymentMethod && (
                <Badge variant="secondary" className="text-xs">
                  {filters.paymentMethod}
                </Badge>
              )}
              {filters.transactionType && (
                <Badge variant="secondary" className="text-xs">
                  {filters.transactionType === "entrada" ? "Receitas" : "Despesas"}
                </Badge>
              )}
              {(filters.minAmount || filters.maxAmount) && (
                <Badge variant="secondary" className="text-xs">
                  R$ {filters.minAmount || "0"} - {filters.maxAmount || "∞"}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};