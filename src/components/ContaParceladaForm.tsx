import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ContaParcelada } from "@/hooks/useContasParceladas";
import { useCartoes } from "@/hooks/useCartoes";
import { FINANCIAL_CATEGORIES, FINANCING_TYPE_LABELS } from "@/constants/categories";
import { CreditCard, Building2, Calculator } from "lucide-react";

interface ContaParceladaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (conta: Omit<ContaParcelada, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  editingConta?: ContaParcelada | null;
}

export const ContaParceladaForm: React.FC<ContaParceladaFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
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
    instituicao_financeira: "",
    taxa_juros: 0,
    debito_automatico: false,
    tipo_financiamento: "parcelamento",
    ativa: true
  });

  useEffect(() => {
    if (editingConta) {
      setFormData({
        nome: editingConta.nome,
        valor_parcela: editingConta.valor_parcela,
        total_parcelas: editingConta.total_parcelas,
        parcelas_pagas: editingConta.parcelas_pagas,
        data_primeira_parcela: editingConta.data_primeira_parcela,
        categoria: editingConta.categoria || "",
        cartao_id: editingConta.cartao_id || "",
        descricao: editingConta.descricao || "",
        instituicao_financeira: editingConta.instituicao_financeira || "",
        taxa_juros: editingConta.taxa_juros || 0,
        debito_automatico: editingConta.debito_automatico,
        tipo_financiamento: editingConta.tipo_financiamento,
        ativa: editingConta.ativa
      });
    } else {
      setFormData({
        nome: "",
        valor_parcela: 0,
        total_parcelas: 1,
        parcelas_pagas: 0,
        data_primeira_parcela: "",
        categoria: "",
        cartao_id: "",
        descricao: "",
        instituicao_financeira: "",
        taxa_juros: 0,
        debito_automatico: false,
        tipo_financiamento: "parcelamento",
        ativa: true
      });
    }
  }, [editingConta, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valor_parcela || !formData.total_parcelas || !formData.data_primeira_parcela) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      onOpenChange(false);
    }
  };

  const parcelasRestantes = formData.total_parcelas - formData.parcelas_pagas;
  const valorTotal = formData.valor_parcela * formData.total_parcelas;
  const valorRestante = formData.valor_parcela * parcelasRestantes;
  const isFinanciamento = formData.tipo_financiamento !== "parcelamento";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isFinanciamento ? (
              <Building2 className="h-5 w-5 text-orange-500" />
            ) : (
              <CreditCard className="h-5 w-5 text-blue-500" />
            )}
            {editingConta ? "Editar" : "Novo"} {isFinanciamento ? "Financiamento" : "Parcelamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Financiamento */}
          <div className="space-y-2">
            <Label htmlFor="tipo_financiamento">Tipo *</Label>
            <Select 
              value={formData.tipo_financiamento} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_financiamento: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FINANCING_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nome e Instituição */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder={isFinanciamento ? "Ex: Honda Civic 2023" : "Ex: iPhone 15, Sofá da sala"}
                required
              />
            </div>

            {isFinanciamento && (
              <div className="space-y-2">
                <Label htmlFor="instituicao_financeira">Instituição Financeira</Label>
                <Input
                  id="instituicao_financeira"
                  value={formData.instituicao_financeira}
                  onChange={(e) => setFormData(prev => ({ ...prev, instituicao_financeira: e.target.value }))}
                  placeholder="Ex: Banco do Brasil, Santander, Caixa"
                />
              </div>
            )}
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

          {/* Taxa de Juros (apenas para financiamentos) */}
          {isFinanciamento && (
            <div className="space-y-2">
              <Label htmlFor="taxa_juros">Taxa de Juros (% ao mês)</Label>
              <Input
                id="taxa_juros"
                type="number"
                step="0.01"
                min="0"
                value={formData.taxa_juros}
                onChange={(e) => setFormData(prev => ({ ...prev, taxa_juros: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          )}

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

            {!isFinanciamento && (
              <div className="space-y-2">
                <Label htmlFor="cartao">Cartão (opcional)</Label>
                <Select value={formData.cartao_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cartao_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
            )}
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

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Detalhes adicionais..."
              rows={3}
            />
          </div>

          {/* Resumo dos Valores */}
          {formData.valor_parcela > 0 && formData.total_parcelas > 0 && (
            <div className="modern-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calculator className="h-4 w-4" />
                Resumo Financeiro
              </div>
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
                  {formData.taxa_juros > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa Mensal:</span>
                      <span className="font-medium text-orange-600">{formData.taxa_juros}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingConta ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};