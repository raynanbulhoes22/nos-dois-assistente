
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Movimentacao } from "@/hooks/useMovimentacoes";

interface MovimentacaoCardProps {
  movimentacao: Movimentacao;
  onEdit?: (mov: Movimentacao) => void;
  onDelete?: (mov: Movimentacao) => void;
}

export const MovimentacaoCard = ({ movimentacao, onEdit, onDelete }: MovimentacaoCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const amountClass = movimentacao.isEntrada ? "text-income" : "text-expense";

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-border/50 bg-card">
      <CardContent className="p-4">
        {/* Título */}
        <div className="mb-3">
          <h3 className="font-medium text-foreground truncate">
            {movimentacao.nome || "Sem descrição"}
          </h3>
        </div>

        {/* Categoria, Data e Valor */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {movimentacao.categoria && (
              <Badge variant="secondary" className="text-xs">
                {movimentacao.categoria}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(movimentacao.data)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <p className={`font-semibold text-base ${amountClass}`}>
              {movimentacao.isEntrada ? "+" : "-"} {formatCurrency(movimentacao.valor)}
            </p>
            
            {/* Ações - aparecem no hover */}
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(movimentacao);
                  }}
                  aria-label="Editar"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(movimentacao);
                  }}
                  aria-label="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
