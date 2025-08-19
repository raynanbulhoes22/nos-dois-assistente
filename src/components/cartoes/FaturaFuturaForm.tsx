import { useState } from "react";
import { useFaturasFuturas } from "@/hooks/useFaturasFuturas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Cartao } from "@/hooks/useCartoes";

interface FaturaFuturaFormProps {
  onSuccess: () => void;
  cartoes: Cartao[];
}

export const FaturaFuturaForm = ({ onSuccess, cartoes }: FaturaFuturaFormProps) => {
  const { addFaturaFutura } = useFaturasFuturas();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    cartao_id: '',
    valor: 0,
    data: new Date(),
    descricao: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cartao_id) newErrors.cartao_id = "Selecione um cartão";
    if (!formData.valor || formData.valor <= 0) newErrors.valor = "Valor deve ser maior que zero";
    if (!formData.descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
    
    // Validar se a data é futura
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (formData.data < hoje) {
      newErrors.data = "A data deve ser futura";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const cartaoSelecionado = cartoes.find(c => c.id === formData.cartao_id);
      
      const success = await addFaturaFutura({
        cartao_id: formData.cartao_id,
        valor: formData.valor,
        data: format(formData.data, "yyyy-MM-dd"),
        mes: formData.data.getMonth() + 1,
        ano: formData.data.getFullYear(),
        descricao: formData.descricao,
        categoria: 'Fatura de Cartão', // Categoria fixa
        apelido_cartao: cartaoSelecionado?.apelido,
        ultimos_digitos: cartaoSelecionado?.ultimos_digitos
      });
      
      if (success) {
        onSuccess();
        // Resetar form
        setFormData({
          cartao_id: '',
          valor: 0,
          data: new Date(),
          descricao: ''
        });
      }
    } catch (error) {
      console.error('Erro ao salvar fatura futura:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Quando selecionar um cartão, calcular automaticamente a data de vencimento
    if (field === "cartao_id" && value) {
      const cartaoSelecionado = cartoes.find(c => c.id === value);
      if (cartaoSelecionado?.dia_vencimento) {
        const proximaDataVencimento = calcularProximaDataVencimento(cartaoSelecionado.dia_vencimento);
        setFormData(prev => ({ ...prev, [field]: value, data: proximaDataVencimento }));
        return;
      }
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Função para calcular a próxima data de vencimento
  const calcularProximaDataVencimento = (diaVencimento: number) => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    
    // Tenta criar a data no mês atual
    let proximaData = new Date(anoAtual, mesAtual, diaVencimento);
    
    // Se a data já passou este mês, vai para o próximo
    if (proximaData <= hoje) {
      proximaData = new Date(anoAtual, mesAtual + 1, diaVencimento);
    }
    
    return proximaData;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cartão */}
      <div className="space-y-2">
        <Label htmlFor="cartao">Cartão *</Label>
        <Select 
          value={formData.cartao_id} 
          onValueChange={(value) => updateFormData("cartao_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cartão" />
          </SelectTrigger>
          <SelectContent>
            {cartoes.map((cartao) => (
              <SelectItem key={cartao.id} value={cartao.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{cartao.apelido} - •••• {cartao.ultimos_digitos}</span>
                  {cartao.dia_vencimento && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (Vence dia {cartao.dia_vencimento})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cartao_id && (
          <p className="text-sm text-destructive">{errors.cartao_id}</p>
        )}
      </div>

      {/* Valor */}
      <div className="space-y-2">
        <Label htmlFor="valor">Valor da Fatura *</Label>
        <CurrencyInput
          value={formData.valor}
          onChange={(value) => updateFormData("valor", value || 0)}
          placeholder="R$ 0,00"
        />
        {errors.valor && (
          <p className="text-sm text-destructive">{errors.valor}</p>
        )}
      </div>

      {/* Data - Somente exibição, preenchida automaticamente */}
      <div className="space-y-2">
        <Label>Data de Vencimento *</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex-1 justify-start text-left font-normal"
            disabled
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.data ? format(formData.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione um cartão primeiro"}
          </Button>
          
          {/* Botão para editar data manualmente se necessário */}
          {formData.cartao_id && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data}
                  onSelect={(date) => date && updateFormData("data", date)}
                  initialFocus
                  locale={ptBR}
                  disabled={(date) => {
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    return date < hoje;
                  }}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {formData.cartao_id && (() => {
          const cartaoSelecionado = cartoes.find(c => c.id === formData.cartao_id);
          return cartaoSelecionado?.dia_vencimento && (
            <p className="text-xs text-success flex items-center gap-1">
              ✅ Data calculada automaticamente para o dia {cartaoSelecionado.dia_vencimento}
            </p>
          );
        })()}
        
        {!formData.cartao_id && (
          <p className="text-xs text-muted-foreground">
            A data será preenchida automaticamente após selecionar o cartão
          </p>
        )}
        
        {errors.data && (
          <p className="text-sm text-destructive">{errors.data}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição da Fatura *</Label>
        <Input
          value={formData.descricao}
          onChange={(e) => updateFormData("descricao", e.target.value)}
          placeholder="Ex: Fatura Nubank - Janeiro/2024"
        />
        {errors.descricao && (
          <p className="text-sm text-destructive">{errors.descricao}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Programar Fatura"}
        </Button>
      </div>
    </form>
  );
};