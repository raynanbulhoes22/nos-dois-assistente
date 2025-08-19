import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileSection } from "./MobileSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit3, Trash2, TrendingUp, Building2, Home, CheckCircle, Clock, RotateCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TabSectionProps {
  fontes: any[];
  contas: any[];
  gastosFixos: any[];
  gastosFixosComStatus?: any[];
  fontesRendaComStatus?: any[];
  contasParceladasComStatus?: any[];
  formatCurrency: (value: number) => string;
  totalRendaAtiva: number;
  totalParcelasAtivas: number;
  totalGastosFixosAtivos: number;
  totalGastosPagos?: number;
  totalGastosPendentes?: number;
  totalRendaRecebida?: number;
  totalRendaPendente?: number;
  totalParcelasPagas?: number;
  totalParcelasPendentes?: number;
  onEditFonte: (fonte: any) => void;
  onDeleteFonte: (id: string) => void;
  onEditContaParcelada: (conta: any) => void;
  onDeleteContaParcelada: (id: string) => void;
  onEditGastoFixo: (gasto: any) => void;
  onDeleteGastoFixo: (id: string) => void;
  onAddFonte: () => void;
  onAddParcelamento: () => void;
  onAddGastoFixo: () => void;
  onToggleStatusRenda?: (id: string, novoStatus: 'recebido' | 'pendente') => void;
  onToggleStatusGastoFixo?: (id: string, novoStatus: 'pago' | 'pendente') => void;
  onToggleStatusParcela?: (id: string, novoStatus: 'pago' | 'pendente') => void;
}

export const TabSection = ({
  fontes,
  contas,
  gastosFixos,
  gastosFixosComStatus,
  fontesRendaComStatus,
  contasParceladasComStatus,
  formatCurrency,
  totalRendaAtiva,
  totalParcelasAtivas,
  totalGastosFixosAtivos,
  totalGastosPagos = 0,
  totalGastosPendentes = 0,
  totalRendaRecebida = 0,
  totalRendaPendente = 0,
  totalParcelasPagas = 0,
  totalParcelasPendentes = 0,
  onEditFonte,
  onDeleteFonte,
  onEditContaParcelada,
  onDeleteContaParcelada,
  onEditGastoFixo,
  onDeleteGastoFixo,
  onAddFonte,
  onAddParcelamento,
  onAddGastoFixo,
  onToggleStatusRenda,
  onToggleStatusGastoFixo,
  onToggleStatusParcela
}: TabSectionProps) => {
  const isMobile = useIsMobile();
  
  const activeFontes = fontesRendaComStatus || fontes.filter(fonte => fonte.ativa);
  const activeContas = contasParceladasComStatus || contas.filter(conta => conta.ativa);
  const activeGastosFixos = gastosFixosComStatus || gastosFixos.filter(gasto => gasto.ativo);

  return (
    <Tabs defaultValue="renda" className="w-full">
      <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'mb-3 h-9' : 'mb-4 h-10'}`}>
        <TabsTrigger value="renda" className={`${isMobile ? 'text-xs px-1' : 'text-sm px-3'} min-w-0`}>
          {isMobile ? 'Renda' : 'Renda'}
        </TabsTrigger>
        <TabsTrigger value="parcelamentos" className={`${isMobile ? 'text-xs px-1' : 'text-sm px-3'} min-w-0`}>
          {isMobile ? 'Parcelas' : 'Parcelados'}
        </TabsTrigger>
        <TabsTrigger value="gastos-fixos" className={`${isMobile ? 'text-xs px-1' : 'text-sm px-3'} min-w-0`}>
          {isMobile ? 'Fixos' : 'Gastos Fixos'}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="renda" className="mt-0">
        <MobileSection
          title="Fontes de Renda"
          subtitle={
            fontesRendaComStatus 
              ? `Total: ${formatCurrency(totalRendaAtiva)}${totalRendaRecebida > 0 ? ` (${formatCurrency(totalRendaRecebida)} recebido` : ''}${totalRendaPendente > 0 ? `${totalRendaRecebida > 0 ? ', ' : ' ('}${formatCurrency(totalRendaPendente)} pendente)` : totalRendaRecebida > 0 ? ')' : ''}`
              : `Total: ${formatCurrency(totalRendaAtiva)}`
          }
          icon={TrendingUp}
          iconVariant="success"
          onAdd={onAddFonte}
          addLabel="Adicionar Renda"
          isEmpty={activeFontes.length === 0}
          emptyMessage="Nenhuma fonte de renda cadastrada"
        >
          <TooltipProvider>
            <div className="space-y-3">
            {activeFontes.map((fonte) => (
              <div key={fonte.id} className="list-item group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{fonte.tipo}</h3>
                      {fontesRendaComStatus && (
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Badge 
                                 variant={fonte.recebido ? "default" : "secondary"}
                                 className={cn(
                                   "h-6 text-xs flex items-center gap-1 px-3 py-1 font-medium",
                                   "transition-all duration-200 ease-in-out",
                                   "border-2 rounded-lg shadow-sm",
                                   fonte.recebido 
                                     ? "bg-success/15 text-success border-success/30 hover:bg-success/25 hover:border-success/50" 
                                     : "bg-warning/15 text-warning border-warning/30 hover:bg-warning/25 hover:border-warning/50",
                                   onToggleStatusRenda && [
                                     "cursor-pointer select-none",
                                     "hover:scale-105 hover:shadow-md",
                                     "active:scale-95 active:shadow-sm",
                                     "hover:ring-2 hover:ring-offset-1",
                                     fonte.recebido 
                                       ? "hover:ring-success/20" 
                                       : "hover:ring-warning/20"
                                   ]
                                 )}
                                 onClick={onToggleStatusRenda ? () => onToggleStatusRenda(fonte.id, fonte.recebido ? 'pendente' : 'recebido') : undefined}
                               >
                                 {fonte.recebido ? (
                                   <>
                                     <CheckCircle className="h-3.5 w-3.5 transition-transform duration-200" />
                                     {isMobile ? "Ok" : "Recebido"}
                                   </>
                                 ) : (
                                   <>
                                     <Clock className="h-3.5 w-3.5 transition-transform duration-200" />
                                     {isMobile ? "Pend" : "Pendente"}
                                   </>
                                 )}
                                 {fonte.statusTipo === 'manual' && (
                                   <div className="ml-1 w-1.5 h-1.5 bg-current rounded-full animate-pulse" title="Status manual" />
                                 )}
                               </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {fonte.recebido ? (
                                <div className="text-xs">
                                  <p className="font-semibold text-success">✅ {fonte.statusTipo === 'manual' ? 'Marcado manualmente como recebido' : 'Recebimento detectado automaticamente'}</p>
                                  {fonte.registroDetectado && (
                                    <>
                                      <p>Valor: {formatCurrency(Math.abs(fonte.registroDetectado.valor))}</p>
                                      <p>Data: {new Date(fonte.registroDetectado.data).toLocaleDateString('pt-BR')}</p>
                                      <p>Categoria: {fonte.registroDetectado.categoria}</p>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs">
                                  <p className="text-warning">⏰ {fonte.statusTipo === 'manual' ? 'Marcado manualmente como pendente' : 'Aguardando recebimento no mês'}</p>
                                  <p className="text-muted-foreground mt-1">Clique no status para alterar manualmente</p>
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                          
                        </div>
                      )}
                    </div>
                    {fonte.descricao && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {fonte.descricao}
                      </p>
                    )}
                    <p className={`text-lg font-bold mt-2 ${
                      fontesRendaComStatus && fonte.recebido 
                        ? "text-muted-foreground" 
                        : "text-success"
                    }`}>
                      {formatCurrency(fonte.valor)}
                    </p>
                  </div>
                  <div className="flex gap-1 group-hover-actions">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onEditFonte(fonte)} 
                      className="h-8 w-8 p-0 focus-ring"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onDeleteFonte(fonte.id)} 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive focus-ring"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </TooltipProvider>
        </MobileSection>
      </TabsContent>

      <TabsContent value="parcelamentos" className="mt-0">
        <MobileSection
          title="Contas Parceladas"
          subtitle={
            contasParceladasComStatus 
              ? `Total: ${formatCurrency(totalParcelasAtivas)}${totalParcelasPagas > 0 ? ` (${formatCurrency(totalParcelasPagas)} pagas` : ''}${totalParcelasPendentes > 0 ? `${totalParcelasPagas > 0 ? ', ' : ' ('}${formatCurrency(totalParcelasPendentes)} pendentes)` : totalParcelasPagas > 0 ? ')' : ''}`
              : `Total Mensal: ${formatCurrency(totalParcelasAtivas)}`
          }
          icon={Building2}
          iconVariant="warning"
          onAdd={onAddParcelamento}
          addLabel="Adicionar Parcelamento"
          isEmpty={activeContas.length === 0}
          emptyMessage="Nenhum parcelamento ativo"
        >
          <TooltipProvider>
            <div className="space-y-3">
              {activeContas.map((conta) => (
                <div key={conta.id} className="list-item group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{conta.nome}</h3>
                        {contasParceladasComStatus && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant={conta.pago ? "default" : "secondary"}
                                className={cn(
                                  "h-6 text-xs flex items-center gap-1 px-3 py-1 font-medium",
                                  "transition-all duration-200 ease-in-out",
                                  "border-2 rounded-lg shadow-sm",
                                  conta.pago 
                                    ? "bg-success/15 text-success border-success/30 hover:bg-success/25 hover:border-success/50" 
                                    : "bg-warning/15 text-warning border-warning/30 hover:bg-warning/25 hover:border-warning/50",
                                  onToggleStatusParcela && [
                                    "cursor-pointer select-none",
                                    "hover:scale-105 hover:shadow-md",
                                    "active:scale-95 active:shadow-sm",
                                    "hover:ring-2 hover:ring-offset-1",
                                    conta.pago 
                                      ? "hover:ring-success/20" 
                                      : "hover:ring-warning/20"
                                  ]
                                )}
                                onClick={onToggleStatusParcela ? () => onToggleStatusParcela(conta.id, conta.pago ? 'pendente' : 'pago') : undefined}
                              >
                                {conta.pago ? (
                                  <>
                                    <CheckCircle className="h-3.5 w-3.5 transition-transform duration-200" />
                                    {isMobile ? "Ok" : "Pago"}
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3.5 w-3.5 transition-transform duration-200" />
                                    {isMobile ? "Pend" : "Pendente"}
                                  </>
                                )}
                                {conta.statusTipo === 'manual' && (
                                  <div className="ml-1 w-1.5 h-1.5 bg-current rounded-full animate-pulse" title="Status manual" />
                                )}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {conta.pago ? (
                                <div className="text-xs">
                                  <p className="font-semibold text-success">✅ {conta.statusTipo === 'manual' ? 'Marcado manualmente como pago' : 'Pagamento detectado automaticamente'}</p>
                                  {conta.registroDetectado && (
                                    <>
                                      <p>Valor: {formatCurrency(Math.abs(conta.registroDetectado.valor))}</p>
                                      <p>Data: {new Date(conta.registroDetectado.data).toLocaleDateString('pt-BR')}</p>
                                      <p>Categoria: {conta.registroDetectado.categoria}</p>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs">
                                  <p className="text-warning">⏰ {conta.statusTipo === 'manual' ? 'Marcado manualmente como pendente' : 'Aguardando pagamento da parcela no mês'}</p>
                                  <p className="text-muted-foreground mt-1">Clique no status para alterar manualmente</p>
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className={`text-lg font-bold ${
                          contasParceladasComStatus && conta.pago 
                            ? "text-muted-foreground" 
                            : "text-warning"
                        }`}>
                          {formatCurrency(conta.valor_parcela)}/mês
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conta.parcelas_pagas || 0}/{conta.total_parcelas} parcelas
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 group-hover-actions">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onEditContaParcelada(conta)} 
                        className="h-8 w-8 p-0 focus-ring"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onDeleteContaParcelada(conta.id)} 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive focus-ring"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </MobileSection>
      </TabsContent>

      <TabsContent value="gastos-fixos" className="mt-0">
        <MobileSection
          title="Gastos Fixos"
          subtitle={
            gastosFixosComStatus 
              ? `Total: ${formatCurrency(totalGastosFixosAtivos)}${totalGastosPagos > 0 ? ` (${formatCurrency(totalGastosPagos)} pagos` : ''}${totalGastosPendentes > 0 ? `${totalGastosPagos > 0 ? ', ' : ' ('}${formatCurrency(totalGastosPendentes)} pendentes)` : totalGastosPagos > 0 ? ')' : ''}`
              : `Total Mensal: ${formatCurrency(totalGastosFixosAtivos)}`
          }
          icon={Home}
          iconVariant="error"
          onAdd={onAddGastoFixo}
          addLabel="Adicionar Gasto Fixo"
          isEmpty={activeGastosFixos.length === 0}
          emptyMessage="Nenhum gasto fixo cadastrado"
        >
          <TooltipProvider>
            <div className="space-y-3">
              {activeGastosFixos.map((gasto) => (
                <div key={gasto.id} className="list-item group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{gasto.nome}</h3>
                        {gastosFixosComStatus && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Badge 
                                 variant={gasto.pago ? "default" : "secondary"}
                                 className={cn(
                                   "h-6 text-xs flex items-center gap-1 px-3 py-1 font-medium",
                                   "transition-all duration-200 ease-in-out",
                                   "border-2 rounded-lg shadow-sm",
                                   gasto.pago 
                                     ? "bg-success/15 text-success border-success/30 hover:bg-success/25 hover:border-success/50" 
                                     : "bg-warning/15 text-warning border-warning/30 hover:bg-warning/25 hover:border-warning/50",
                                   onToggleStatusGastoFixo && [
                                     "cursor-pointer select-none",
                                     "hover:scale-105 hover:shadow-md",
                                     "active:scale-95 active:shadow-sm",
                                     "hover:ring-2 hover:ring-offset-1",
                                     gasto.pago 
                                       ? "hover:ring-success/20" 
                                       : "hover:ring-warning/20"
                                   ]
                                 )}
                                 onClick={onToggleStatusGastoFixo ? () => onToggleStatusGastoFixo(gasto.id, gasto.pago ? 'pendente' : 'pago') : undefined}
                               >
                                 {gasto.pago ? (
                                   <>
                                     <CheckCircle className="h-3.5 w-3.5 transition-transform duration-200" />
                                     {isMobile ? "Ok" : "Pago"}
                                   </>
                                 ) : (
                                   <>
                                     <Clock className="h-3.5 w-3.5 transition-transform duration-200" />
                                     {isMobile ? "Pend" : "Pendente"}
                                   </>
                                 )}
                                 {gasto.statusTipo === 'manual' && (
                                   <div className="ml-1 w-1.5 h-1.5 bg-current rounded-full animate-pulse" title="Status manual" />
                                 )}
                               </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                               {gasto.pago ? (
                                 <div className="text-xs">
                                   <p className="font-semibold text-success">✅ {gasto.statusTipo === 'manual' ? 'Marcado manualmente como pago' : 'Pagamento detectado automaticamente'}</p>
                                   {gasto.registroDetectado && (
                                     <>
                                       <p>Valor: {formatCurrency(Math.abs(gasto.registroDetectado.valor))}</p>
                                       <p>Data: {new Date(gasto.registroDetectado.data).toLocaleDateString('pt-BR')}</p>
                                       <p>Categoria: {gasto.registroDetectado.categoria}</p>
                                     </>
                                   )}
                                 </div>
                               ) : (
                                 <div className="text-xs">
                                   <p className="text-warning">⏰ {gasto.statusTipo === 'manual' ? 'Marcado manualmente como pendente' : 'Aguardando pagamento no mês'}</p>
                                   <p className="text-muted-foreground mt-1">Clique no status para alterar manualmente</p>
                                 </div>
                               )}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {gasto.categoria && (
                        <p className="text-xs text-muted-foreground">
                          {gasto.categoria}
                        </p>
                      )}
                      <div className="flex flex-col gap-1 mt-1">
                        <p className={`text-lg font-bold ${
                          gastosFixosComStatus && gasto.pago 
                            ? "text-muted-foreground" 
                            : "text-destructive"
                        }`}>
                          -{formatCurrency(gasto.valor_mensal)}
                        </p>
                        {gasto.observacoes && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {gasto.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 group-hover-actions">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onEditGastoFixo(gasto)} 
                        className="h-8 w-8 p-0 focus-ring"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onDeleteGastoFixo(gasto.id)} 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive focus-ring"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </MobileSection>
      </TabsContent>
    </Tabs>
  );
};