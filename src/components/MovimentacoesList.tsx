import React, { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Movimentacao } from "@/hooks/useMovimentacoes";
import { Badge } from "@/components/ui/badge";

interface MovimentacoesListProps {
  items: Movimentacao[];
  onItemClick?: (item: Movimentacao) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function MovimentacoesList({ items, onItemClick }: MovimentacoesListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const estimate = useMemo(() => 72, []);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimate,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="h-[70vh] overflow-auto rounded-md border bg-card">
      <div
        style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={item.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="cursor-pointer focus-ring hover:bg-muted/50"
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate max-w-[52vw] sm:max-w-[60vw]">
                      {item.nome || "Sem descrição"}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2 min-w-0">
                    {item.categoria && (
                      <Badge variant={item.isEntrada ? "default" : "secondary"}>
                        {item.categoria}
                      </Badge>
                    )}
                    {item.forma_pagamento && <span>{item.forma_pagamento}</span>}
                    {item.estabelecimento && (
                      <span className="truncate">• {item.estabelecimento}</span>
                    )}
                  </div>
                </div>
                <div
                  className={`font-semibold whitespace-nowrap ${item.isEntrada ? "text-income" : "text-expense"}`}
                >
                  {item.isEntrada ? "+" : "-"} {formatCurrency(item.valor)}
                </div>
              </div>
              <div className="h-px bg-border" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
