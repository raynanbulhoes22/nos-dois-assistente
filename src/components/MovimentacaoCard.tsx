
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import {
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Movimentacao } from "@/hooks/useMovimentacoes";

interface MovimentacaoCardProps {
  movimentacao: Movimentacao;
  onEdit?: (mov: Movimentacao) => void;
  onDelete?: (mov: Movimentacao) => void;
  onDuplicate?: (mov: Movimentacao) => void;
}

export const MovimentacaoCard = ({ movimentacao, onEdit, onDelete, onDuplicate }: MovimentacaoCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const amountClass = movimentacao.isEntrada ? "text-income" : "text-expense";

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Erro ao copiar", e);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!movimentacao.numero_wpp) return;
    const num = movimentacao.numero_wpp.replace(/\D/g, "");
    const url = `https://wa.me/${num.startsWith("55") ? num : `55${num}`}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            {/* Nome e Data */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-base truncate pr-4">
                {movimentacao.nome || "Sem descrição"}
              </h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(movimentacao.data)}
              </span>
            </div>

            {/* Categoria e Valor */}
            <div className="flex items-center justify-between">
              {movimentacao.categoria && (
                <Badge variant="secondary" className="text-xs">
                  {movimentacao.categoria}
                </Badge>
              )}
              <p className={`font-bold text-lg ${amountClass}`}>
                {movimentacao.isEntrada ? "+" : "-"} {formatCurrency(movimentacao.valor)}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 ml-4">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-primary/10"
                onClick={() => onEdit(movimentacao)}
                aria-label="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(movimentacao)}
                aria-label="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(movimentacao)}>
                    Duplicar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => copyToClipboard(formatCurrency(movimentacao.valor), "valor")}>
                  Copiar valor
                </DropdownMenuItem>
                {movimentacao.numero_wpp && (
                  <DropdownMenuItem onClick={handleOpenWhatsApp}>
                    Abrir no WhatsApp
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
