import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Movimentacao } from "@/hooks/useMovimentacoes";
import { Copy, MessageCircle } from "lucide-react";

interface MovimentacaoDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacao: Movimentacao | null;
}

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
    : "-";

export function MovimentacaoDetailsDialog({ open, onOpenChange, movimentacao }: MovimentacaoDetailsDialogProps) {
  const m = movimentacao;

  const copy = async (text?: string | number | null) => {
    if (!text && text !== 0) return;
    try {
      await navigator.clipboard.writeText(String(text));
    } catch (e) {
      console.error(e);
    }
  };

  const openWhats = () => {
    if (!m?.numero_wpp) return;
    const num = m.numero_wpp.replace(/\D/g, "");
    const url = `https://wa.me/${num.startsWith("55") ? num : `55${num}`}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da transação</DialogTitle>
        </DialogHeader>

        {!m ? null : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{m.nome || "Sem descrição"}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(m.data).toLocaleDateString("pt-BR")} • {m.tipo_movimento || "-"}
                </p>
              </div>
              <div className={`text-right font-semibold ${m.isEntrada ? "text-income" : "text-expense"}`}>
                {m.isEntrada ? "+" : "-"} {formatCurrency(m.valor)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {m.categoria && <Badge variant={m.isEntrada ? "default" : "secondary"}>{m.categoria}</Badge>}
              {m.recorrente && <Badge variant="outline">Recorrente</Badge>}
              {m.origem && <Badge variant="outline">{m.origem}</Badge>}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Responsável</dt>
                <dd className="font-medium">{m.nome || "Não informado"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Forma de pagamento</dt>
                <dd>{m.forma_pagamento || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estabelecimento</dt>
                <dd>{m.estabelecimento || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Instituição</dt>
                <dd>{m.instituicao || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cartão</dt>
                <dd>{m.cartao_final ? `•••• ${m.cartao_final}` : "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Origem</dt>
                <dd>{m.origem || (m.numero_wpp ? "WhatsApp" : "Manual")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Número WhatsApp</dt>
                <dd className="flex items-center gap-2">
                  <span>{m.numero_wpp || "-"}</span>
                  {m.numero_wpp && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => copy(m.numero_wpp)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={openWhats}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ID transação</dt>
                <dd className="flex items-center gap-2">
                  <span className="truncate">{m.id_transacao || m.id}</span>
                  <Button variant="ghost" size="icon" onClick={() => copy(m.id_transacao || m.id)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </dd>
              </div>
            </dl>

            {m.observacao && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Observação</div>
                <div className="rounded-md border bg-muted/30 p-3 text-sm">{m.observacao}</div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
