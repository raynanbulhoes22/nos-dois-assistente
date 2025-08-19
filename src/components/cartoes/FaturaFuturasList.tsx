import { useState } from "react";
import { useFaturasFuturas, type FaturaFutura } from "@/hooks/useFaturasFuturas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FaturaFuturaForm } from "./FaturaFuturaForm";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, Edit, Trash2, Calendar, CreditCard } from "lucide-react";
import type { Cartao } from "@/hooks/useCartoes";

interface FaturaFuturasListProps {
  faturas: FaturaFutura[];
  cartoes: Cartao[];
}

export const FaturaFuturasList = ({ faturas, cartoes }: FaturaFuturasListProps) => {
  const { deleteFaturaFutura } = useFaturasFuturas();
  const [editingFatura, setEditingFatura] = useState<FaturaFutura | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (fatura: FaturaFutura) => {
    setEditingFatura(fatura);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta fatura futura?")) {
      await deleteFaturaFutura(id);
    }
  };

  if (faturas.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2" />
        <p>Nenhuma fatura programada para este mês</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {faturas.map((fatura) => (
          <div key={fatura.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <CreditCard className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="font-medium">{fatura.descricao}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{fatura.apelido_cartao}</span>
                  {fatura.ultimos_digitos && (
                    <Badge variant="outline" className="text-xs">
                      •••• {fatura.ultimos_digitos}
                    </Badge>
                  )}
                  {fatura.categoria && (
                    <Badge variant="secondary" className="text-xs">
                      {fatura.categoria}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-destructive">
                  {formatCurrency(fatura.valor)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(fatura.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(fatura)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(fatura.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fatura Futura</DialogTitle>
          </DialogHeader>
          {editingFatura && (
            <FaturaFuturaForm
              onSuccess={() => {
                setShowEditModal(false);
                setEditingFatura(null);
              }}
              cartoes={cartoes}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};