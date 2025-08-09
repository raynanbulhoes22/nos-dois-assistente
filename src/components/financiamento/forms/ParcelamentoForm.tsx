import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ContaParcelada } from "@/hooks/useContasParceladas";
import { useCartoes } from "@/hooks/useCartoes";
import { FINANCIAL_CATEGORIES } from "@/constants/categories";

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
    
    if (!formData.nome || !formData.valor_parcela || !formData.total_parcelas || !formData.data_primeira_parcela) {
      return;
    }

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
  };

  const parcelasRestantes = formData.total_parcelas - formData.parcelas_pagas;
  const valorTotal = formData.valor_parcela * formData.total_parcelas;
  const valorRestante = formData.valor_parcela * parcelasRestantes;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          ← Voltar
        </Button>
        <h3 className="text-lg font-semibold">Parcelamento</h3>
      </div>

      {/* Produto/Serviço e Loja */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Produto/Serviço *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: iPhone 15, Sofá da sala"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loja">Loja/Estabelecimento</Label>
          <Input
            id="loja"
            value={formData.loja}
            onChange={(e) => setFormData(prev => ({ ...prev, loja: e.target.value }))}
            placeholder="Ex: Magazine Luiza, Apple Store"
          />
        </div>
      </div>

      {/* Valores e Parcelas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valor_parcela">Valor da Parcela *</Label>
          <Input
            id="valor_parcela"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_parcela}
            onChange={(e) => setFormData(prev => ({ ...prev, valor_parcela: parseFloat(e.target.value) || 0 }))}
            placeholder="R$ 0,00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_parcelas">Total de Parcelas *</Label>
          <Input
            id="total_parcelas"
            type="number"
            min="1"
            value={formData.total_parcelas}
            onChange={(e) => setFormData(prev => ({ ...prev, total_parcelas: parseInt(e.target.value) || 0 }))}
            placeholder="12"
            required
          />
        </div>
      </div>

      {/* Parcelas Pagas e Data */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="parcelas_pagas">Parcelas Pagas</Label>
          <Input
            id="parcelas_pagas"
            type="number"
            min="0"
            max={formData.total_parcelas}
            value={formData.parcelas_pagas}
            onChange={(e) => setFormData(prev => ({ ...prev, parcelas_pagas: parseInt(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="data_primeira_parcela">Primeira Parcela *</Label>
          <Input
            id="data_primeira_parcela"
            type="date"
            value={formData.data_primeira_parcela}
            onChange={(e) => setFormData(prev => ({ ...prev, data_primeira_parcela: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* Categoria e Cartão */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
            <SelectTrigger>
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
          <Label htmlFor="cartao">Cartão Utilizado</Label>
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
          <Label htmlFor="debito_automatico">Débito Automático</Label>
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

      {/* Resumo */}
      {formData.valor_parcela > 0 && formData.total_parcelas > 0 && (
        <div className="modern-card p-4 space-y-3">
          <h4 className="font-medium text-sm">Resumo do Parcelamento</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="font-medium">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parcelas Restantes:</span>
                <span className="font-medium">{parcelasRestantes}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Restante:</span>
                <span className="font-medium text-primary">R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
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