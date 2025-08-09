import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/required-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ContaParcelada, ContaParceladaCreate } from "@/hooks/useContasParceladas";
import { FINANCIAL_CATEGORIES } from "@/constants/categories";
import { validateForm, getRequiredFields } from "@/lib/financial-validations";
import { toast } from "@/hooks/use-toast";

interface EmprestimoFormProps {
  onSubmit: (conta: ContaParceladaCreate) => Promise<boolean>;
  onBack: () => void;
  editingConta?: ContaParcelada | null;
  tipo: "emprestimo_pessoal" | "emprestimo_consignado";
}

export const EmprestimoForm: React.FC<EmprestimoFormProps> = ({
  onSubmit,
  onBack,
  editingConta,
  tipo
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
    taxa_juros: 0,
    debito_automatico: false,
    tipo_financiamento: tipo,
    ativa: true,
    valor_emprestado: 0,
    finalidade: "",
    margem_consignavel: 0,
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
        taxa_juros: editingConta.taxa_juros || 0,
        debito_automatico: editingConta.debito_automatico,
        tipo_financiamento: tipo,
        ativa: editingConta.ativa,
        valor_emprestado: dadosEspecificos.valor_emprestado || 0,
        finalidade: dadosEspecificos.finalidade || "",
        margem_consignavel: dadosEspecificos.margem_consignavel || 0,
        dados_especificos: dadosEspecificos
      });
    }
  }, [editingConta, tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validationData = {
        nome: formData.nome,
        valor_emprestado: formData.valor_emprestado,
        taxa_juros: formData.taxa_juros,
        valor_parcela: formData.valor_parcela,
        total_parcelas: formData.total_parcelas,
        data_primeira_parcela: formData.data_primeira_parcela,
        instituicao_financeira: formData.instituicao_financeira,
        finalidade: formData.finalidade,
        margem_consignavel: formData.margem_consignavel,
        parcelas_pagas: formData.parcelas_pagas,
        categoria: formData.categoria,
        debito_automatico: formData.debito_automatico,
        descricao: formData.descricao,
      };

      validateForm(validationData, tipo);

      const dadosEspecificos: any = {
        valor_emprestado: formData.valor_emprestado,
        finalidade: formData.finalidade
      };

      if (tipo === "emprestimo_consignado") {
        dadosEspecificos.margem_consignavel = formData.margem_consignavel;
      }

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

  const valorTotal = formData.valor_parcela * formData.total_parcelas;
  const jurosTotal = valorTotal - formData.valor_emprestado;
  const parcelasRestantes = formData.total_parcelas - formData.parcelas_pagas;
  const valorRestante = formData.valor_parcela * parcelasRestantes;

  const isConsignado = tipo === "emprestimo_consignado";
  const requiredFields = getRequiredFields(tipo);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header Mobile-First */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          ← Voltar
        </Button>
        <h3 className="text-base font-semibold">
          {isConsignado ? "Empréstimo Consignado" : "Empréstimo Pessoal"}
        </h3>
      </div>

      {/* Nome/Identificação */}
      <div className="space-y-2">
        <RequiredLabel htmlFor="nome" required={requiredFields.includes("nome")}>Identificação do Empréstimo</RequiredLabel>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          placeholder={isConsignado ? "Ex: Consignado - Pagamento de Dívidas" : "Ex: Empréstimo - Capital de Giro"}
          required
          className="text-sm"
        />
      </div>

      {/* Valores Essenciais - Mobile Vertical */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <RequiredLabel htmlFor="valor_emprestado" required={requiredFields.includes("valor_emprestado")}>Valor Emprestado</RequiredLabel>
          <Input
            id="valor_emprestado"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_emprestado}
            onChange={(e) => setFormData(prev => ({ ...prev, valor_emprestado: parseFloat(e.target.value) || 0 }))}
            placeholder="R$ 0,00"
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <RequiredLabel htmlFor="taxa_juros" required={requiredFields.includes("taxa_juros")}>Taxa de Juros (% ao mês)</RequiredLabel>
          <Input
            id="taxa_juros"
            type="number"
            step="0.01"
            min="0"
            value={formData.taxa_juros}
            onChange={(e) => setFormData(prev => ({ ...prev, taxa_juros: parseFloat(e.target.value) || 0 }))}
            placeholder={isConsignado ? "1.50" : "3.50"}
            className="text-sm"
          />
        </div>
      </div>

      {/* Específicos do Consignado */}
      {isConsignado && (
        <div className="space-y-2">
          <RequiredLabel htmlFor="margem_consignavel" required={requiredFields.includes("margem_consignavel")}>Margem Consignável (% do salário)</RequiredLabel>
          <Input
            id="margem_consignavel"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.margem_consignavel}
            onChange={(e) => setFormData(prev => ({ ...prev, margem_consignavel: parseFloat(e.target.value) || 0 }))}
            placeholder="30.0"
            className="text-sm"
          />
        </div>
      )}

      {/* Parcelas - Mobile Vertical */}
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
            placeholder="36"
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

      {/* Instituição e Categoria */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <RequiredLabel htmlFor="instituicao_financeira" required={requiredFields.includes("instituicao_financeira")}>Instituição Financeira</RequiredLabel>
          <Input
            id="instituicao_financeira"
            value={formData.instituicao_financeira}
            onChange={(e) => setFormData(prev => ({ ...prev, instituicao_financeira: e.target.value }))}
            placeholder="Ex: Banco do Brasil, Caixa"
          />
        </div>
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
      </div>

      {/* Finalidade */}
      <div className="space-y-2">
        <RequiredLabel htmlFor="finalidade" required={requiredFields.includes("finalidade")}>Finalidade do Empréstimo</RequiredLabel>
        <Textarea
          id="finalidade"
          value={formData.finalidade}
          onChange={(e) => setFormData(prev => ({ ...prev, finalidade: e.target.value }))}
          placeholder="Ex: Quitação de dívidas, capital de giro, reforma..."
          rows={3}
        />
      </div>

      {/* Débito Automático */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <RequiredLabel htmlFor="debito_automatico" required={requiredFields.includes("debito_automatico")}>Débito Automático</RequiredLabel>
          <p className="text-sm text-muted-foreground">
            {isConsignado ? "Desconto direto na folha de pagamento" : "Débito automático na conta corrente"}
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
          <h4 className="font-medium text-xs">Resumo do Empréstimo</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emprestado:</span>
                <span className="font-medium">R$ {formData.valor_emprestado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
                <span className="text-muted-foreground">Taxa:</span>
                <span className="font-medium text-orange-600">{formData.taxa_juros}%</span>
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