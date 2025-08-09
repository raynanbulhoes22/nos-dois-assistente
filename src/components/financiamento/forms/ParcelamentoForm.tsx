import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/required-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ContaParcelada } from "@/hooks/useContasParceladas";
import { useCartoes } from "@/hooks/useCartoes";
import { FINANCIAL_CATEGORIES } from "@/constants/categories";
import { validateForm, getRequiredFields } from "@/lib/financial-validations";
import { toast } from "@/hooks/use-toast";

interface ParcelamentoFormProps {
  onSubmit: (conta: Omit<ContaParcelada, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onBack: () => void;
  editingConta?: ContaParcelada | null;
}

export const ParcelamentoForm: React.FC<ParcelamentoFormProps> = ({
  onSubmit,
  onBack,
  editingConta
}) => {
  const { cartoes } = useCartoes();
  
  const [formData, setFormData] = useState({
    nome: "",
    valor_parcela: 0,
    total_parcelas: 1,
    parcelas_pagas: 0,
    data_primeira_parcela: "",
    categoria: "",
    cartao_id: "",
    descricao: "",
    debito_automatico: false,
    tipo_financiamento: "parcelamento",
    ativa: true,
    loja: "",
    dados_especificos: {}
  });

  useEffect(() => {
    if (editingConta) {
      const dadosEspecificos = editingConta.dados_especificos as any || {};
      setFormData({
        nome: editingConta.nome,
        valor_parcela: editingConta.valor_parcela,
        total_parcelas: editingConta.total_parcelas,
        parcelas_pagas: editingConta.parcelas_pagas,
        data_primeira_parcela: editingConta.data_primeira_parcela,
        categoria: editingConta.categoria || "",
        cartao_id: editingConta.cartao_id || "",
        descricao: editingConta.descricao || "",
        debito_automatico: editingConta.debito_automatico,
        tipo_financiamento: "parcelamento",
        ativa: editingConta.ativa,
        loja: dadosEspecificos.loja || "",
        dados_especificos: dadosEspecificos
      });
    }
  }, [editingConta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validationData = {
        nome: formData.nome,
        valor_parcela: formData.valor_parcela,
        total_parcelas: formData.total_parcelas,
        data_primeira_parcela: formData.data_primeira_parcela,
        loja: formData.loja,
        cartao_id: formData.cartao_id,
        parcelas_pagas: formData.parcelas_pagas,
        categoria: formData.categoria,
        debito_automatico: formData.debito_automatico,
        descricao: formData.descricao,
      };

      validateForm(validationData, "parcelamento");

      const dadosEspecificos = {
        loja: formData.loja
      };

      const success = await onSubmit({
        ...formData,
        dados_especificos: dadosEspecificos
      });
      
      if (success) {
        onBack();
      }
    } catch (error) {
      toast({
        title: "Erro de validação",
        description: error instanceof Error ? error.message : "Verifique os campos obrigatórios",
        variant: "destructive",
      });
    }
  };

  const parcelasRestantes = formData.total_parcelas - formData.parcelas_pagas;
  const valorTotal = formData.valor_parcela * formData.total_parcelas;
  const valorRestante = formData.valor_parcela * parcelasRestantes;
  
  const requiredFields = getRequiredFields("parcelamento");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header Mobile-First */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          ← Voltar
        </Button>
        <h3 className="text-base font-semibold">Parcelamento</h3>
      </div>

      {/* Produto/Serviço e Loja - Mobile Vertical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <RequiredLabel htmlFor="nome" required={requiredFields.includes("nome")}>Produto/Serviço</RequiredLabel>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: iPhone 15, Sofá da sala"
            required
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="loja" required={requiredFields.includes("loja")}>Loja/Estabelecimento</RequiredLabel>
          <Input
            id="loja"
            value={formData.loja}
            onChange={(e) => setFormData(prev => ({ ...prev, loja: e.target.value }))}
            placeholder="Ex: Magazine Luiza, Apple Store"
            className="text-sm"
          />
        </div>
      </div>

      {/* Valores e Parcelas - Mobile Vertical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <RequiredLabel htmlFor="valor_parcela" required={requiredFields.includes("valor_parcela")}>Valor da Parcela</RequiredLabel>
          <Input
            id="valor_parcela"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_parcela}
            onChange={(e) => setFormData(prev => ({ ...prev, valor_parcela: parseFloat(e.target.value) || 0 }))}
            placeholder="R$ 0,00"
            required
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="total_parcelas" required={requiredFields.includes("total_parcelas")}>Total de Parcelas</RequiredLabel>
          <Input
            id="total_parcelas"
            type="number"
            min="1"
            value={formData.total_parcelas}
            onChange={(e) => setFormData(prev => ({ ...prev, total_parcelas: parseInt(e.target.value) || 0 }))}
            placeholder="12"
            required
            className="text-sm"
          />
        </div>
      </div>

      {/* Parcelas Pagas e Data - Mobile Vertical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <RequiredLabel htmlFor="parcelas_pagas" required={requiredFields.includes("parcelas_pagas")}>Parcelas Pagas</RequiredLabel>
          <Input
            id="parcelas_pagas"
            type="number"
            min="0"
            max={formData.total_parcelas}
            value={formData.parcelas_pagas}
            onChange={(e) => setFormData(prev => ({ ...prev, parcelas_pagas: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="data_primeira_parcela" required={requiredFields.includes("data_primeira_parcela")}>Primeira Parcela</RequiredLabel>
          <Input
            id="data_primeira_parcela"
            type="date"
            value={formData.data_primeira_parcela}
            onChange={(e) => setFormData(prev => ({ ...prev, data_primeira_parcela: e.target.value }))}
            required
            className="text-sm"
          />
        </div>
      </div>

      {/* Categoria e Cartão - Mobile Vertical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <RequiredLabel htmlFor="categoria" required={requiredFields.includes("categoria")}>Categoria</RequiredLabel>
          <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {FINANCIAL_CATEGORIES["Parcelamentos & Financiamentos"].map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="cartao" required={requiredFields.includes("cartao_id")}>Cartão Utilizado</RequiredLabel>
          <Select value={formData.cartao_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cartao_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cartão" />
            </SelectTrigger>
            <SelectContent>
              {cartoes.map(cartao => (
                <SelectItem key={cartao.id} value={cartao.id}>
                  {cartao.apelido} - *{cartao.ultimos_digitos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Débito Automático */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <RequiredLabel htmlFor="debito_automatico" required={requiredFields.includes("debito_automatico")}>Débito Automático</RequiredLabel>
          <p className="text-sm text-muted-foreground">
            O pagamento é debitado automaticamente da conta
          </p>
        </div>
        <Switch
          id="debito_automatico"
          checked={formData.debito_automatico}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, debito_automatico: checked }))}
        />
      </div>

      {/* Resumo Compacto */}
      {formData.valor_parcela > 0 && formData.total_parcelas > 0 && (
        <div className="bg-muted/50 p-3 rounded-lg space-y-2">
          <h4 className="font-medium text-xs">Resumo</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground text-[10px]">Total</p>
              <p className="font-medium">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-[10px]">Restantes</p>
              <p className="font-medium">{parcelasRestantes}x</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-[10px]">A Pagar</p>
              <p className="font-medium text-primary">R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {editingConta ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
};