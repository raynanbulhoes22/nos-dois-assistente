import { useState } from "react";
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
  CalendarDays,
  MapPin,
  CreditCard,
  FileText,
  MoreVertical,
  Building2,
  Repeat,
  MessageCircle,
} from "lucide-react";
import { Movimentacao } from "@/hooks/useMovimentacoes";

interface MovimentacaoCardProps {
  movimentacao: Movimentacao;
  onEdit?: (mov: Movimentacao) => void;
  onDelete?: (mov: Movimentacao) => void;
  onDuplicate?: (mov: Movimentacao) => void;
}

export const MovimentacaoCard = ({ movimentacao, onEdit, onDelete, onDuplicate }: MovimentacaoCardProps) => {
  const [showMore, setShowMore] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const originLabel = (() => {
    const o = (movimentacao.origem || "").toLowerCase();
    if (movimentacao.numero_wpp || o.includes("whats")) return "WhatsApp";
    return o ? movimentacao.origem! : "Manual";
  })();

  const amountClass = movimentacao.isEntrada ? "text-income" : "text-expense";
  const borderClass = movimentacao.isEntrada ? "border-income" : "border-expense";

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Silent copy; toasts are handled at page level if needed
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

  const shortObs = (text?: string) => {
    if (!text) return "";
    if (showMore || text.length <= 120) return text;
    return text.slice(0, 120) + "…";
  };

  const maskCard = (last4?: string) => (last4 ? `•••• ${last4}` : "");

  return (
    <Card className={`hover:shadow-md transition-shadow border-l-4 ${borderClass}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{movimentacao.nome || "Sem descrição"}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CalendarDays className="h-4 w-4" />
              <span>{formatDate(movimentacao.data)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 ml-2">
            <p className={`font-bold text-lg whitespace-nowrap ${amountClass}`}>
              {movimentacao.isEntrada ? "+" : "-"} {formatCurrency(movimentacao.valor)}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Ações da movimentação">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {onEdit && <DropdownMenuItem onClick={() => onEdit(movimentacao)}>Editar</DropdownMenuItem>}
                {onDuplicate && <DropdownMenuItem onClick={() => onDuplicate(movimentacao)}>Duplicar</DropdownMenuItem>}
                {onDelete && <DropdownMenuItem className="text-destructive" onClick={() => onDelete(movimentacao)}>Excluir</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => copyToClipboard(formatCurrency(movimentacao.valor), "valor")}>Copiar valor</DropdownMenuItem>
                {movimentacao.id && (
                  <DropdownMenuItem onClick={() => copyToClipboard(movimentacao.id, "ID")}>Copiar ID</DropdownMenuItem>
                )}
                {movimentacao.numero_wpp && (
                  <DropdownMenuItem onClick={handleOpenWhatsApp}>Abrir no WhatsApp</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Badges and chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {movimentacao.categoria && (
            <Badge variant={movimentacao.isEntrada ? "default" : "secondary"}>{movimentacao.categoria}</Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            {originLabel === "WhatsApp" ? (
              <MessageCircle className="h-3.5 w-3.5" />
            ) : (
              <Building2 className="h-3.5 w-3.5" />
            )}
            {originLabel}
          </Badge>
          {movimentacao.recorrente && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Repeat className="h-3.5 w-3.5" /> Recorrente
            </Badge>
          )}
          {(movimentacao.instituicao || movimentacao.cartao_final) && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">
                {movimentacao.instituicao || "Instituição"}
                {movimentacao.cartao_final ? ` • ${maskCard(movimentacao.cartao_final)}` : ""}
              </span>
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {movimentacao.estabelecimento && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{movimentacao.estabelecimento}</span>
            </div>
          )}

          {movimentacao.forma_pagamento && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{movimentacao.forma_pagamento}</span>
            </div>
          )}

          {movimentacao.observacao && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5" />
              <span className="italic">
                {shortObs(movimentacao.observacao)}
                {movimentacao.observacao.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setShowMore((s) => !s)}
                    className="ml-2 underline text-foreground/80 hover:text-foreground"
                    aria-label={showMore ? "Mostrar menos" : "Ver mais"}
                  >
                    {showMore ? "ver menos" : "ver mais"}
                  </button>
                )}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
