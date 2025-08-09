import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ContaParcelada } from "@/hooks/useContasParceladas";
import { useCartoes } from "@/hooks/useCartoes";

interface ContaParceladaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (conta: Omit<ContaParcelada, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  editingConta?: ContaParcelada | null;
}

const categorias = [
  "Eletrônicos",
  "Móveis",
  "Veículo",
  "Casa/Apartamento",
  "Educação",
  "Saúde",
  "Empréstimo",
  "Cartão de Crédito",
  "Outros"
];

export const ContaParceladaForm: React.FC<ContaParceladaFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  editingConta
}) => {
  const { cartoes } = useCartoes();
  const [formData, setFormData] = useState({
    nome: editingConta?.nome || "",
    valor_parcela: editingConta?.valor_parcela || 0,
    total_parcelas: editingConta?.total_parcelas || 0,
    parcelas_pagas: editingConta?.parcelas_pagas || 0,
    data_primeira_parcela: editingConta?.data_primeira_parcela || "",
    categoria: editingConta?.categoria || "",
    cartao_id: editingConta?.cartao_id || "",
    descricao: editingConta?.descricao || "",
    ativa: editingConta?.ativa ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valor_parcela || !formData.total_parcelas || !formData.data_primeira_parcela) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      onOpenChange(false);
      setFormData({
        nome: "",
        valor_parcela: 0,
        total_parcelas: 0,
        parcelas_pagas: 0,
        data_primeira_parcela: "",
        categoria: "",
        cartao_id: "",
        descricao: "",
        ativa: true
      });
    }
  };

  const parcelasRestantes = formData.total_parcelas - formData.parcelas_pagas;
  const valorTotal = formData.valor_parcela * formData.total_parcelas;
  const valorRestante = formData.valor_parcela * parcelasRestantes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingConta ? "Editar Conta Parcelada" : "Nova Conta Parcelada"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Conta *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: iPhone 15, Sofá da sala"
              required
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

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

          {formData.valor_parcela > 0 && formData.total_parcelas > 0 && (
            <div className="modern-card p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="font-medium">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parcelas Restantes:</span>
                <span className="font-medium">{parcelasRestantes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Restante:</span>
                <span className="font-medium text-primary">R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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