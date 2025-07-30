import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FINANCIAL_CATEGORIES, TRANSACTION_TYPES, PAYMENT_METHODS } from "@/constants/categories";

interface Transaction {
  id: string;
  tipo: string;
  valor: number;
  data: string;
  categoria: string;
  nome: string;
  forma_pagamento?: string;
  estabelecimento?: string;
  instituicao?: string;
  origem?: string;
  recorrente?: boolean;
  observacao?: string;
}

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editTransaction?: Transaction | null;
  userId: string;
}

export const TransactionForm = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  editTransaction,
  userId 
}: TransactionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: editTransaction?.tipo || "",
    valor: editTransaction?.valor?.toString() || "",
    data: editTransaction ? new Date(editTransaction.data) : new Date(),
    categoria: editTransaction?.categoria || "",
    nome: editTransaction?.nome || "",
    forma_pagamento: editTransaction?.forma_pagamento || "",
    estabelecimento: editTransaction?.estabelecimento || "",
    instituicao: editTransaction?.instituicao || "",
    origem: editTransaction?.origem || "",
    recorrente: editTransaction?.recorrente || false,
    observacao: editTransaction?.observacao || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.tipo) newErrors.tipo = "Tipo é obrigatório";
    if (!formData.valor) newErrors.valor = "Valor é obrigatório";
    if (!formData.categoria) newErrors.categoria = "Categoria é obrigatória";
    if (!formData.nome) newErrors.nome = "Nome/Descrição é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Determinar tipo_movimento baseado no tipo
      let tipo_movimento = "";
      if (formData.tipo === "Receita") {
        tipo_movimento = "entrada";
      } else if (formData.tipo === "Despesa") {
        tipo_movimento = "saida";
      } else {
        tipo_movimento = "transferencia";
      }

      const transactionData = {
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        data: format(formData.data, "yyyy-MM-dd"),
        categoria: formData.categoria,
        nome: formData.nome,
        forma_pagamento: formData.forma_pagamento || null,
        estabelecimento: formData.estabelecimento || null,
        instituicao: formData.instituicao || null,
        origem: formData.origem || null,
        recorrente: formData.recorrente,
        observacao: formData.observacao || null,
        user_id: userId,
        tipo_movimento: tipo_movimento
      };

      let error;
      
      if (editTransaction) {
        // Atualizar transação existente
        const result = await supabase
          .from('registros_financeiros')
          .update(transactionData)
          .eq('id', editTransaction.id)
          .eq('user_id', userId);
        error = result.error;
      } else {
        // Criar nova transação
        const result = await supabase
          .from('registros_financeiros')
          .insert([transactionData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: editTransaction ? "Transação atualizada" : "Transação criada",
        description: editTransaction ? "A transação foi atualizada com sucesso." : "A transação foi adicionada com sucesso."
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a transação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editTransaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => updateFormData("tipo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-red-500">{errors.tipo}</p>
              )}
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                value={formData.valor}
                onChange={(e) => updateFormData("valor", e.target.value)}
                type="number"
                step="0.01"
                placeholder="0,00"
              />
              {errors.valor && (
                <p className="text-sm text-red-500">{errors.valor}</p>
              )}
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data ? format(formData.data, "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data}
                    onSelect={(date) => date && updateFormData("data", date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => updateFormData("categoria", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FINANCIAL_CATEGORIES).map(([group, categories]) => (
                    <div key={group}>
                      <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                        {group}
                      </div>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-sm text-red-500">{errors.categoria}</p>
              )}
            </div>

            {/* Nome/Descrição */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome">Nome/Descrição *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => updateFormData("nome", e.target.value)}
                placeholder="Ex: Compra no supermercado"
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome}</p>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select 
                value={formData.forma_pagamento || ""} 
                onValueChange={(value) => updateFormData("forma_pagamento", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estabelecimento */}
            <div className="space-y-2">
              <Label htmlFor="estabelecimento">Estabelecimento</Label>
              <Input
                value={formData.estabelecimento}
                onChange={(e) => updateFormData("estabelecimento", e.target.value)}
                placeholder="Ex: Supermercado ABC"
              />
            </div>

            {/* Instituição */}
            <div className="space-y-2">
              <Label htmlFor="instituicao">Instituição</Label>
              <Input
                value={formData.instituicao}
                onChange={(e) => updateFormData("instituicao", e.target.value)}
                placeholder="Ex: Banco do Brasil"
              />
            </div>

            {/* Origem */}
            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Input
                value={formData.origem}
                onChange={(e) => updateFormData("origem", e.target.value)}
                placeholder="Ex: Conta corrente"
              />
            </div>

            {/* Recorrente */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.recorrente}
                  onCheckedChange={(checked) => updateFormData("recorrente", !!checked)}
                />
                <Label htmlFor="recorrente">Transação recorrente</Label>
              </div>
            </div>

            {/* Observação */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                value={formData.observacao}
                onChange={(e) => updateFormData("observacao", e.target.value)}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : editTransaction ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};