import React, { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Movimentacao } from "@/hooks/useMovimentacoes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Copy } from "lucide-react";
import { getCategoryColorClass } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";

interface MovimentacoesListProps {
  items: Movimentacao[];
  onItemClick?: (item: Movimentacao) => void;
  onEdit?: (item: Movimentacao) => void;
  onDelete?: (item: Movimentacao) => void;
  onDuplicate?: (item: Movimentacao) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function MovimentacoesList({ items, onItemClick, onEdit, onDelete, onDuplicate }: MovimentacoesListProps) {
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
              className="cursor-pointer focus-ring hover:bg-muted/50 group"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div 
                  className="min-w-0 flex-1 cursor-pointer" 
                  onClick={() => onItemClick?.(item)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate max-w-[45vw] sm:max-w-[55vw]">
                      {item.nome || "Sem descrição"}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2 min-w-0">
                    {item.categoria && (
                      <span 
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium border",
                          getCategoryColorClass(item.categoria)
                        )}
                      >
                        {item.categoria}
                      </span>
                    )}
                    {item.forma_pagamento && <span>{item.forma_pagamento}</span>}
                    {item.estabelecimento && (
                      <span className="truncate">• {item.estabelecimento}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <div
                    className={`font-semibold whitespace-nowrap ${item.isEntrada ? "text-income" : "text-expense"}`}
                  >
                    {item.isEntrada ? "+" : "-"} {formatCurrency(item.valor)}
                  </div>
                  
                  {(onEdit || onDelete || onDuplicate) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {onEdit && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {onDuplicate && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(item);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
