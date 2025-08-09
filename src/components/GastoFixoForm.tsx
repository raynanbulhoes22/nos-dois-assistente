import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/ui/currency-input';
import { GastoFixo } from '@/hooks/useGastosFixos';

interface GastoFixoFormProps {
  gastoFixo?: GastoFixo;
  onSubmit: (data: Partial<GastoFixo>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIAS_GASTOS_FIXOS = [
  'Moradia',
  'Transporte', 
  'Alimentação',
  'Saúde',
  'Educação',
  'Serviços',
  'Lazer',
  'Outros'
];

export const GastoFixoForm = ({ gastoFixo, onSubmit, onCancel, isLoading }: GastoFixoFormProps) => {
  const [formData, setFormData] = useState({
    nome: gastoFixo?.nome || '',
    categoria: gastoFixo?.categoria || '',
    valor_mensal: gastoFixo?.valor_mensal || 0,
    ativo: gastoFixo?.ativo ?? true,
    data_inicio: gastoFixo?.data_inicio || new Date().toISOString().split('T')[0],
    observacoes: gastoFixo?.observacoes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return;
    }

    if (formData.valor_mensal <= 0) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Gasto</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          placeholder="Ex: Aluguel, Conta de Luz..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoria</Label>
        <Select
          value={formData.categoria}
          onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIAS_GASTOS_FIXOS.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor">Valor Mensal</Label>
        <CurrencyInput
          value={formData.valor_mensal}
          onChange={(value) => setFormData(prev => ({ ...prev, valor_mensal: value || 0 }))}
          placeholder="R$ 0,00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="data_inicio">Data de Início</Label>
        <Input
          id="data_inicio"
          type="date"
          value={formData.data_inicio}
          onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
        />
        <Label htmlFor="ativo">Gasto ativo</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
          placeholder="Observações adicionais (opcional)"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {gastoFixo ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
};