import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContaParcelada } from "@/hooks/useContasParceladas";
import { FinanciamentoSelector } from "@/components/financiamento/FinanciamentoSelector";
import { ParcelamentoForm } from "@/components/financiamento/forms/ParcelamentoForm";
import { FinanciamentoVeicularForm } from "@/components/financiamento/forms/FinanciamentoVeicularForm";
import { EmprestimoForm } from "@/components/financiamento/forms/EmprestimoForm";

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
  const [selectedTipo, setSelectedTipo] = useState<string | null>(
    editingConta?.tipo_financiamento || null
  );

  const handleTipoSelect = (tipo: string) => {
    setSelectedTipo(tipo);
  };

  const handleBack = () => {
    setSelectedTipo(null);
  };

  const handleFormSubmit = async (conta: Omit<ContaParcelada, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const success = await onSubmit(conta);
    if (success) {
      setSelectedTipo(null);
      onOpenChange(false);
    }
    return success;
  };

  const renderForm = () => {
    switch (selectedTipo) {
      case "parcelamento":
        return (
          <ParcelamentoForm
            onSubmit={handleFormSubmit}
            onBack={handleBack}
            editingConta={editingConta}
          />
        );
      
      case "financiamento_veicular":
        return (
          <FinanciamentoVeicularForm
            onSubmit={handleFormSubmit}
            onBack={handleBack}
            editingConta={editingConta}
          />
        );
      
      case "emprestimo_pessoal":
        return (
          <EmprestimoForm
            onSubmit={handleFormSubmit}
            onBack={handleBack}
            editingConta={editingConta}
            tipo="emprestimo_pessoal"
          />
        );
      
      case "emprestimo_consignado":
        return (
          <EmprestimoForm
            onSubmit={handleFormSubmit}
            onBack={handleBack}
            editingConta={editingConta}
            tipo="emprestimo_consignado"
          />
        );
      
      default:
        return <FinanciamentoSelector onSelect={handleTipoSelect} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 p-0">
        <DialogHeader className="px-8 pt-8 pb-0">
          <DialogTitle className="text-2xl font-bold">
            {editingConta ? "Editar Financiamento" : "Novo Financiamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8">
          {renderForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
};