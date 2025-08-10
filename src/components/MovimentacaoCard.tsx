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
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
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

  const getTransactionIcon = () => {
    if (movimentacao.isEntrada) return <TrendingUp className="h-5 w-5 text-income" />;
    return <TrendingDown className="h-5 w-5 text-expense" />;
  };

  const getIconBackground = () => {
    return movimentacao.isEntrada 
      ? "bg-income/10 text-income" 
      : "bg-expense/10 text-expense";
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar/Ícone */}
          <div className={`p-3 rounded-full ${getIconBackground()}`}>
            {getTransactionIcon()}
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-base truncate pr-2">
                {movimentacao.nome || "Sem descrição"}
              </h3>
              
              {/* Ações sempre visíveis */}
              <div className="flex items-center gap-1 ml-2">
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-primary/10"
                    onClick={() => onEdit(movimentacao)}
                    aria-label="Editar movimentação"
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
                    aria-label="Excluir movimentação"
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
                    {movimentacao.id && (
                      <DropdownMenuItem onClick={() => copyToClipboard(movimentacao.id, "ID")}>
                        Copiar ID
                      </DropdownMenuItem>
                    )}
                    {movimentacao.numero_wpp && (
                      <DropdownMenuItem onClick={handleOpenWhatsApp}>
                        Abrir no WhatsApp
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Data e Categoria */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{formatDate(movimentacao.data)}</span>
              </div>
              {movimentacao.categoria && (
                <Badge variant="secondary" className="text-xs h-5">
                  {movimentacao.categoria}
                </Badge>
              )}
            </div>

            {/* Valor */}
            <p className={`font-bold text-lg ${amountClass} mb-2`}>
              {movimentacao.isEntrada ? "+" : "-"} {formatCurrency(movimentacao.valor)}
            </p>

            {/* Informações Adicionais */}
            <div className="space-y-1">
              {movimentacao.estabelecimento && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{movimentacao.estabelecimento}</span>
                </div>
              )}

              {movimentacao.forma_pagamento && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>{movimentacao.forma_pagamento}</span>
                </div>
              )}

              {/* Badges extras compactas */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="text-xs h-5 flex items-center gap-1">
                  {originLabel === "WhatsApp" ? (
                    <MessageCircle className="h-3 w-3" />
                  ) : (
                    <Building2 className="h-3 w-3" />
                  )}
                  {originLabel}
                </Badge>
                
                {movimentacao.recorrente && (
                  <Badge variant="outline" className="text-xs h-5 flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    Recorrente
                  </Badge>
                )}
                
                {(movimentacao.instituicao || movimentacao.cartao_final) && (
                  <Badge variant="outline" className="text-xs h-5 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">
                      {movimentacao.instituicao || "Instituição"}
                      {movimentacao.cartao_final ? ` • ${maskCard(movimentacao.cartao_final)}` : ""}
                    </span>
                  </Badge>
                )}
              </div>

              {/* Observação expandível */}
              {movimentacao.observacao && (
                <div className="mt-2 p-2 bg-muted/30 rounded-md">
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="italic text-muted-foreground">
                        {shortObs(movimentacao.observacao)}
                      </span>
                      {movimentacao.observacao.length > 120 && (
                        <button
                          type="button"
                          onClick={() => setShowMore((s) => !s)}
                          className="ml-2 text-xs underline text-primary hover:text-primary/80"
                          aria-label={showMore ? "Mostrar menos" : "Ver mais"}
                        >
                          {showMore ? "ver menos" : "ver mais"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
