import { useState, useMemo } from "react";
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
import { CalendarIcon, CreditCard, TrendingUp, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FINANCIAL_CATEGORIES, TRANSACTION_TYPES, PAYMENT_METHODS } from "@/constants/categories";
import { useCartoes } from "@/hooks/useCartoes";
import { useFontesRenda } from "@/hooks/useFontesRenda";
import { useProfileNames } from "@/hooks/useProfileNames";

interface Transaction {
  id: string;
  tipo: string;
  valor: number;
  data: string;
  categoria: string;
  nome: string;
  titulo?: string;
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
  initialType?: 'entrada' | 'saida';
  transactionSubType?: string;
}

export const TransactionForm = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  editTransaction,
  userId,
  initialType,
  transactionSubType
}: TransactionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  // Map initialType to the expected transaction type format
  const getInitialTipo = () => {
    if (editTransaction?.tipo) return editTransaction.tipo;
    if (transactionSubType === 'transferencia') return 'comprovante_pagamento';
    if (initialType === 'entrada') return 'entrada_manual';
    if (initialType === 'saida') return 'registro_manual';
    return "";
  };

  const [formData, setFormData] = useState({
    tipo: getInitialTipo(),
    valor: editTransaction?.valor?.toString() || "",
    data: editTransaction ? new Date(editTransaction.data) : new Date(),
    categoria: editTransaction?.categoria || "",
    nome: editTransaction?.nome || "",
    titulo: editTransaction?.titulo || "",
    forma_pagamento: editTransaction?.forma_pagamento || "",
    estabelecimento: editTransaction?.estabelecimento || "",
    instituicao: editTransaction?.instituicao || "",
    origem: editTransaction?.origem || "",
    recorrente: editTransaction?.recorrente || false,
    observacao: editTransaction?.observacao || "",
    cartao_id: "",
    parcelas: "1",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { cartoes } = useCartoes();
  const { fontes } = useFontesRenda();
  const { availableNames } = useProfileNames(userId);

  // Categorias filtradas baseadas no tipo selecionado
  const availableCategories = useMemo(() => {
    if (!formData.tipo) return FINANCIAL_CATEGORIES;
    
    switch (formData.tipo) {
      case "entrada_manual":
        return { "Entradas": FINANCIAL_CATEGORIES.Entradas };
      case "comprovante_pagamento":
        return { "Financeiras": FINANCIAL_CATEGORIES.Financeiras };
      case "registro_manual":
      default:
        const { Entradas, ...restCategories } = FINANCIAL_CATEGORIES;
        return restCategories;
    }
  }, [formData.tipo]);

  // Campos visíveis baseados no tipo
  const showField = useMemo(() => {
    const type = formData.tipo;
    return {
      formaPagamento: type === "registro_manual",
      estabelecimento: type === "registro_manual",
      cartao: type === "registro_manual" && (formData.forma_pagamento === "Cartão de Crédito" || formData.forma_pagamento === "Cartão de Débito"),
      parcelas: type === "registro_manual" && formData.forma_pagamento === "Cartão de Crédito",
      instituicao: type === "comprovante_pagamento",
      origem: type !== "entrada_manual",
      fonteRenda: type === "entrada_manual",
    };
  }, [formData.tipo, formData.forma_pagamento]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.tipo) newErrors.tipo = "Tipo é obrigatório";
    if (!formData.valor) newErrors.valor = "Valor é obrigatório";
    if (!formData.categoria) newErrors.categoria = "Categoria é obrigatória";
    if (!formData.titulo) newErrors.titulo = "Descrição é obrigatória";
    if (!formData.nome) newErrors.nome = "Registrado por é obrigatório";
    
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
      if (formData.tipo === "entrada_manual" || formData.tipo === "entrada_comprovada") {
        tipo_movimento = "entrada";
      } else if (formData.tipo === "registro_manual" || formData.tipo === "comprovante_pagamento") {
        tipo_movimento = "saida";
      } else {
        tipo_movimento = "saida"; // default para saída
      }

      const transactionData = {
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        data: format(formData.data, "yyyy-MM-dd"),
        categoria: formData.categoria,
        nome: formData.nome,
        titulo: formData.titulo,
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset campos relacionados quando o tipo muda
      if (field === "tipo") {
        newData.categoria = "";
        newData.forma_pagamento = "";
        newData.cartao_id = "";
        newData.parcelas = "1";
      }
      
      // Reset cartão quando forma de pagamento muda
      if (field === "forma_pagamento") {
        newData.cartao_id = "";
        newData.parcelas = "1";
      }
      
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Função para obter ícone do tipo
  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "entrada_manual":
        return <TrendingUp className="h-4 w-4" />;
      case "registro_manual":
        return <CreditCard className="h-4 w-4" />;
      case "comprovante_pagamento":
        return <ArrowLeftRight className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Função para obter cor do tipo
  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case "entrada_manual":
        return "text-green-600 bg-green-50 border-green-200";
      case "registro_manual":
        return "text-red-600 bg-red-50 border-red-200";
      case "comprovante_pagamento":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "";
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
          {/* Mostrar seleção de tipo apenas quando não há tipo pré-definido */}
          {!initialType && !transactionSubType && !editTransaction && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Tipo de Transação *</Label>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[
                  { value: "entrada_manual", label: "Entrada", desc: "Receitas e recebimentos" },
                  { value: "registro_manual", label: "Saída", desc: "Gastos e despesas" },
                  { value: "comprovante_pagamento", label: "Transferência", desc: "Transferências e investimentos" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFormData("tipo", option.value)}
                    className={cn(
                      "flex flex-col items-center p-2 md:p-4 rounded-lg border-2 transition-all hover:scale-[1.02]",
                      formData.tipo === option.value 
                        ? getTypeColor(option.value)
                        : "border-border bg-background hover:bg-accent"
                    )}
                  >
                    {getTypeIcon(option.value)}
                    <span className="font-medium mt-1 md:mt-2 text-xs md:text-sm text-center">{option.label}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground text-center hidden md:block">{option.desc}</span>
                  </button>
                ))}
              </div>
              {errors.tipo && (
                <p className="text-sm text-red-500">{errors.tipo}</p>
              )}
            </div>
          )}

          {formData.tipo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{/* Conteúdo continuará... */}

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  value={formData.valor}
                  onChange={(e) => updateFormData("valor", e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="text-lg"
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
                  <PopoverContent className="w-auto p-0 bg-background border shadow-lg z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.data}
                      onSelect={(date) => date && updateFormData("data", date)}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Categoria */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => updateFormData("categoria", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {Object.entries(availableCategories).map(([group, categories]) => (
                      <div key={group}>
                        <div className="px-2 py-1 text-sm font-semibold text-muted-foreground bg-muted/50">
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

              {/* Descrição da Transação */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo">
                  {formData.tipo === "entrada_manual" ? "Descrição da Receita" : 
                   formData.tipo === "comprovante_pagamento" ? "Descrição da Transferência" : 
                   "Descrição da Despesa"} *
                </Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => updateFormData("titulo", e.target.value)}
                  placeholder={
                    formData.tipo === "entrada_manual" ? "Ex: Salário de Janeiro" :
                    formData.tipo === "comprovante_pagamento" ? "Ex: Transferência para poupança" :
                    "Ex: Compra no supermercado"
                  }
                />
                {errors.titulo && (
                  <p className="text-sm text-red-500">{errors.titulo}</p>
                )}
              </div>

              {/* Registrado por */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nome">Registrado por *</Label>
                <Select 
                  value={formData.nome} 
                  onValueChange={(value) => updateFormData("nome", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Quem está registrando esta transação?" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {availableNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome}</p>
                )}
              </div>

              {/* Fonte de Renda - Apenas para Entradas */}
              {showField.fonteRenda && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Fonte de Renda</Label>
                  <Select 
                    value={formData.origem || ""} 
                    onValueChange={(value) => updateFormData("origem", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fonte" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {fontes.filter(fonte => fonte.ativa).map((fonte) => (
                        <SelectItem key={fonte.id} value={fonte.descricao || fonte.tipo}>
                          {fonte.descricao || fonte.tipo} - R$ {fonte.valor.toFixed(2)}
                        </SelectItem>
                      ))}
                      <SelectItem value="Outra fonte">Outra fonte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Forma de Pagamento - Apenas para Saídas */}
              {showField.formaPagamento && (
                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
                  <Select 
                    value={formData.forma_pagamento || ""} 
                    onValueChange={(value) => updateFormData("forma_pagamento", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Como você pagou?" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Cartão - Condicional */}
              {showField.cartao && cartoes.length > 0 && (
                <div className="space-y-2">
                  <Label>Cartão</Label>
                  <Select 
                    value={formData.cartao_id || ""} 
                    onValueChange={(value) => updateFormData("cartao_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cartão" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {cartoes.filter(cartao => cartao.ativo).map((cartao) => (
                        <SelectItem key={cartao.id} value={cartao.id}>
                          {cartao.apelido} ****{cartao.ultimos_digitos}
                          <span className="text-xs text-muted-foreground ml-2">
                            Limite: R$ {cartao.limite.toFixed(2)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Parcelas - Apenas para Cartão de Crédito */}
              {showField.parcelas && (
                <div className="space-y-2">
                  <Label>Parcelas</Label>
                  <Select 
                    value={formData.parcelas} 
                    onValueChange={(value) => updateFormData("parcelas", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x de R$ {formData.valor ? (parseFloat(formData.valor) / num).toFixed(2) : "0,00"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Estabelecimento - Apenas para Saídas */}
              {showField.estabelecimento && (
                <div className="space-y-2">
                  <Label htmlFor="estabelecimento">Estabelecimento</Label>
                  <Input
                    value={formData.estabelecimento}
                    onChange={(e) => updateFormData("estabelecimento", e.target.value)}
                    placeholder="Ex: Supermercado ABC"
                  />
                </div>
              )}

              {/* Instituição - Apenas para Transferências */}
              {showField.instituicao && (
                <div className="space-y-2">
                  <Label htmlFor="instituicao">Instituição Financeira</Label>
                  <Input
                    value={formData.instituicao}
                    onChange={(e) => updateFormData("instituicao", e.target.value)}
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
              )}

              {/* Origem/Destino */}
              {showField.origem && (
                <div className="space-y-2">
                  <Label htmlFor="origem">
                    {formData.tipo === "comprovante_pagamento" ? "Conta Origem" : "Origem"}
                  </Label>
                  <Input
                    value={formData.origem}
                    onChange={(e) => updateFormData("origem", e.target.value)}
                    placeholder={
                      formData.tipo === "comprovante_pagamento" 
                        ? "Ex: Conta corrente" 
                        : "Ex: Conta corrente"
                    }
                  />
                </div>
              )}

              {/* Recorrente */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={formData.recorrente}
                    onCheckedChange={(checked) => updateFormData("recorrente", !!checked)}
                  />
                  <div>
                    <Label htmlFor="recorrente" className="font-medium">Transação recorrente</Label>
                    <p className="text-xs text-muted-foreground">Esta transação se repete mensalmente</p>
                  </div>
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
          )}

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