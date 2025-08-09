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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-hidden border-0 p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b bg-muted/30 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-center">
            Parcelamentos & Financiamentos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {renderForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
};