import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/required-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ContaParcelada } from "@/hooks/useContasParceladas";
import { FINANCIAL_CATEGORIES } from "@/constants/categories";
import { validateForm, getRequiredFields } from "@/lib/financial-validations";
import { toast } from "@/hooks/use-toast";

interface FinanciamentoVeicularFormProps {
  onSubmit: (conta: Omit<ContaParcelada, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onBack: () => void;
  editingConta?: ContaParcelada | null;
}

export const FinanciamentoVeicularForm: React.FC<FinanciamentoVeicularFormProps> = ({
  onSubmit,
  onBack,
  editingConta
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    valor_parcela: 0,
    total_parcelas: 1,
    parcelas_pagas: 0,
    data_primeira_parcela: "",
    categoria: "",
    descricao: "",
    instituicao_financeira: "",
    taxa_nominal_anual: 0,
    taxa_efetiva_anual: 0,
    debito_automatico: false,
    tipo_financiamento: "financiamento_veicular",
    ativa: true,
    valor_bem: 0,
    valor_entrada: 0,
    valor_financiado: 0,
    ano_veiculo: new Date().getFullYear(),
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
        descricao: editingConta.descricao || "",
        instituicao_financeira: editingConta.instituicao_financeira || "",
        taxa_nominal_anual: dadosEspecificos.taxa_nominal_anual || 0,
        taxa_efetiva_anual: dadosEspecificos.taxa_efetiva_anual || 0,
        debito_automatico: editingConta.debito_automatico,
        tipo_financiamento: "financiamento_veicular",
        ativa: editingConta.ativa,
        valor_bem: dadosEspecificos.valor_bem || 0,
        valor_entrada: dadosEspecificos.valor_entrada || 0,
        valor_financiado: dadosEspecificos.valor_financiado || (dadosEspecificos.valor_bem - dadosEspecificos.valor_entrada) || 0,
        ano_veiculo: dadosEspecificos.ano_veiculo || new Date().getFullYear(),
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
        valor_bem: formData.valor_bem,
        valor_entrada: formData.valor_entrada,
        valor_financiado: formData.valor_financiado,
        valor_parcela: formData.valor_parcela,
        total_parcelas: formData.total_parcelas,
        taxa_nominal_anual: formData.taxa_nominal_anual,
        taxa_efetiva_anual: formData.taxa_efetiva_anual,
        data_primeira_parcela: formData.data_primeira_parcela,
        ano_veiculo: formData.ano_veiculo,
        instituicao_financeira: formData.instituicao_financeira,
        parcelas_pagas: formData.parcelas_pagas,
        categoria: formData.categoria,
        debito_automatico: formData.debito_automatico,
        descricao: formData.descricao,
      };

      validateForm(validationData, "financiamento_veicular");

      const dadosEspecificos = {
        valor_bem: formData.valor_bem,
        valor_entrada: formData.valor_entrada,
        ano_veiculo: formData.ano_veiculo,
        valor_financiado: formData.valor_financiado,
        taxa_nominal_anual: formData.taxa_nominal_anual,
        taxa_efetiva_anual: formData.taxa_efetiva_anual
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

  // Auto-calculate financed value if not manually set
  const valorFinanciadoCalculado = formData.valor_bem - formData.valor_entrada;
  const valorFinanciado = formData.valor_financiado || valorFinanciadoCalculado;
  const valorTotal = formData.valor_parcela * formData.total_parcelas;
  const jurosTotal = valorTotal - valorFinanciado;
  const parcelasRestantes = formData.total_parcelas - formData.parcelas_pagas;
  const valorRestante = formData.valor_parcela * parcelasRestantes;
  
  const requiredFields = getRequiredFields("financiamento_veicular");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header Mobile-First */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          ← Voltar
        </Button>
        <h3 className="text-base font-semibold">Financiamento Veicular</h3>
      </div>

      {/* Dados do Veículo - Mobile Vertical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <RequiredLabel htmlFor="nome" required={requiredFields.includes("nome")}>Modelo do Veículo</RequiredLabel>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: Honda Civic EXL, Toyota Corolla"
            required
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="ano_veiculo" required={requiredFields.includes("ano_veiculo")}>Ano de Fabricação</RequiredLabel>
          <Input
            id="ano_veiculo"
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={formData.ano_veiculo}
            onChange={(e) => setFormData(prev => ({ ...prev, ano_veiculo: parseInt(e.target.value) || new Date().getFullYear() }))}
            placeholder={new Date().getFullYear().toString()}
            className="text-sm"
          />
        </div>
      </div>

      {/* Seção de Valores */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium border-b pb-2">Valores do Financiamento</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-2">
            <RequiredLabel htmlFor="valor_bem" required={requiredFields.includes("valor_bem")}>Valor do Veículo</RequiredLabel>
            <Input
              id="valor_bem"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_bem}
              onChange={(e) => {
                const valor = parseFloat(e.target.value) || 0;
                setFormData(prev => ({ 
                  ...prev, 
                  valor_bem: valor,
                  // Auto-update financed value if not manually set
                  valor_financiado: prev.valor_financiado === (prev.valor_bem - prev.valor_entrada) ? 
                    valor - prev.valor_entrada : prev.valor_financiado
                }));
              }}
              placeholder="R$ 18.000,00"
              className="text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <RequiredLabel htmlFor="valor_entrada" required={requiredFields.includes("valor_entrada")}>Valor da Entrada</RequiredLabel>
            <Input
              id="valor_entrada"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_entrada}
              onChange={(e) => {
                const entrada = parseFloat(e.target.value) || 0;
                setFormData(prev => ({ 
                  ...prev, 
                  valor_entrada: entrada,
                  // Auto-update financed value if not manually set
                  valor_financiado: prev.valor_financiado === (prev.valor_bem - prev.valor_entrada) ? 
                    prev.valor_bem - entrada : prev.valor_financiado
                }));
              }}
              placeholder="R$ 0,00"
              className="text-sm"
            />
          </div>
          
          <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
            <RequiredLabel htmlFor="valor_financiado" required={requiredFields.includes("valor_financiado")}>Valor Financiado</RequiredLabel>
            <Input
              id="valor_financiado"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_financiado}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_financiado: parseFloat(e.target.value) || 0 }))}
              placeholder="R$ 20.723,05"
              className="text-sm"
            />
            {formData.valor_bem > 0 && formData.valor_financiado > (formData.valor_bem - formData.valor_entrada) && (
              <p className="text-xs text-muted-foreground">
                ℹ️ Inclui taxas e custos adicionais
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Financiamento - Mobile Vertical */}
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
            placeholder="60"
            required
            className="text-sm"
          />
        </div>
      </div>

      {/* Seção de Taxas */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium border-b pb-2">Taxas de Juros</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <RequiredLabel htmlFor="taxa_nominal_anual" required={requiredFields.includes("taxa_nominal_anual")}>Taxa Nominal Anual (%)</RequiredLabel>
            <Input
              id="taxa_nominal_anual"
              type="number"
              step="0.01"
              min="0"
              value={formData.taxa_nominal_anual}
              onChange={(e) => setFormData(prev => ({ ...prev, taxa_nominal_anual: parseFloat(e.target.value) || 0 }))}
              placeholder="14.40"
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Taxa informada no contrato
            </p>
          </div>
          
          <div className="space-y-2">
            <RequiredLabel htmlFor="taxa_efetiva_anual" required={requiredFields.includes("taxa_efetiva_anual")}>Taxa Efetiva Anual (%)</RequiredLabel>
            <Input
              id="taxa_efetiva_anual"
              type="number"
              step="0.01"
              min="0"
              value={formData.taxa_efetiva_anual}
              onChange={(e) => setFormData(prev => ({ ...prev, taxa_efetiva_anual: parseFloat(e.target.value) || 0 }))}
              placeholder="15.47"
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              CET com todos os custos
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <RequiredLabel htmlFor="instituicao_financeira" required={requiredFields.includes("instituicao_financeira")}>Instituição Financeira</RequiredLabel>
          <Input
            id="instituicao_financeira"
            value={formData.instituicao_financeira}
            onChange={(e) => setFormData(prev => ({ ...prev, instituicao_financeira: e.target.value }))}
            placeholder="Ex: Banco do Brasil, Santander"
            className="text-sm"
          />
        </div>
      </div>

      {/* Parcelas Pagas e Data */}
      <div className="grid grid-cols-2 gap-4">
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
          />
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <RequiredLabel htmlFor="categoria" required={requiredFields.includes("categoria")}>Categoria</RequiredLabel>
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
          <h4 className="font-medium text-xs">Resumo do Financiamento</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Financiado:</span>
                <span className="font-medium">R$ {valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restantes:</span>
                <span className="font-medium">{parcelasRestantes}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa Efetiva:</span>
                <span className="font-medium text-orange-600">{formData.taxa_efetiva_anual}% a.a.</span>
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