import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileSection } from "./MobileSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit3, Trash2, TrendingUp, CreditCard, Building2, Home, CheckCircle, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { LimiteCartaoDisplay } from "@/components/cartoes/LimiteCartaoDisplay";

interface TabSectionProps {
  fontes: any[];
  cartoes: any[];
  contas: any[];
  gastosFixos: any[];
  gastosFixosComStatus?: any[];
  fontesRendaComStatus?: any[];
  formatCurrency: (value: number) => string;
  totalRendaAtiva: number;
  totalLimiteCartoes: number;
  totalParcelasAtivas: number;
  totalGastosFixosAtivos: number;
  totalGastosPagos?: number;
  totalGastosPendentes?: number;
  totalRendaRecebida?: number;
  totalRendaPendente?: number;
  onEditFonte: (fonte: any) => void;
  onDeleteFonte: (id: string) => void;
  onEditCartao: (cartao: any) => void;
  onDeleteCartao: (id: string) => void;
  onEditContaParcelada: (conta: any) => void;
  onDeleteContaParcelada: (id: string) => void;
  onEditGastoFixo: (gasto: any) => void;
  onDeleteGastoFixo: (id: string) => void;
  onAddFonte: () => void;
  onAddCartao: () => void;
  onAddParcelamento: () => void;
  onAddGastoFixo: () => void;
}

export const TabSection = ({
  fontes,
  cartoes,
  contas,
  gastosFixos,
  gastosFixosComStatus,
  fontesRendaComStatus,
  formatCurrency,
  totalRendaAtiva,
  totalLimiteCartoes,
  totalParcelasAtivas,
  totalGastosFixosAtivos,
  totalGastosPagos = 0,
  totalGastosPendentes = 0,
  totalRendaRecebida = 0,
  totalRendaPendente = 0,
  onEditFonte,
  onDeleteFonte,
  onEditCartao,
  onDeleteCartao,
  onEditContaParcelada,
  onDeleteContaParcelada,
  onEditGastoFixo,
  onDeleteGastoFixo,
  onAddFonte,
  onAddCartao,
  onAddParcelamento,
  onAddGastoFixo
}: TabSectionProps) => {
  const isMobile = useIsMobile();
  
  const activeFontes = fontesRendaComStatus || fontes.filter(fonte => fonte.ativa);
  const activeCartoes = cartoes.filter(cartao => cartao.ativo);
  const activeContas = contas.filter(conta => conta.ativa);
  const activeGastosFixos = gastosFixosComStatus || gastosFixos.filter(gasto => gasto.ativo);

  return (
    <Tabs defaultValue="renda" className="w-full">
      <TabsList className={`grid w-full grid-cols-4 ${isMobile ? 'mb-3 h-9' : 'mb-4 h-10'}`}>
        <TabsTrigger value="renda" className={`${isMobile ? 'text-xs px-1' : 'text-sm px-3'} min-w-0`}>
          {isMobile ? 'Renda' : 'Renda'}
        </TabsTrigger>
        <TabsTrigger value="cartoes" className={`${isMobile ? 'text-xs px-1' : 'text-sm px-3'} min-w-0`}>
          {isMobile ? 'Cartões' : 'Cartões'}
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant={fonte.recebido ? "default" : "secondary"}
                              className={`h-5 text-xs flex items-center gap-1 ${
                                fonte.recebido 
                                  ? "bg-success/10 text-success border-success/20 hover:bg-success/20" 
                                  : "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                              }`}
                            >
                              {fonte.recebido ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  {isMobile ? "Ok" : "Recebido"}
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3" />
                                  {isMobile ? "Pend" : "Pendente"}
                                </>
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {fonte.recebido ? (
                              <div className="text-xs">
                                <p className="font-semibold text-success">✅ Recebimento detectado</p>
                                {fonte.registroDetectado && (
                                  <>
                                    <p>Valor: {formatCurrency(Math.abs(fonte.registroDetectado.valor))}</p>
                                    <p>Data: {new Date(fonte.registroDetectado.data).toLocaleDateString('pt-BR')}</p>
                                    <p>Categoria: {fonte.registroDetectado.categoria}</p>
                                  </>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-warning">⏰ Aguardando recebimento no mês</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
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

      <TabsContent value="cartoes" className="mt-0">
        <MobileSection
          title="Cartões de Crédito"
          subtitle={`Limite Total: ${formatCurrency(totalLimiteCartoes)}`}
          icon={CreditCard}
          iconVariant="primary"
          onAdd={onAddCartao}
          addLabel="Adicionar Cartão"
          isEmpty={activeCartoes.length === 0}
          emptyMessage="Nenhum cartão cadastrado"
        >
          <div className="space-y-4">
            {activeCartoes.map((cartao) => (
              <LimiteCartaoDisplay
                key={cartao.id}
                cartao={cartao}
                onEdit={() => onEditCartao(cartao)}
                onDelete={() => onDeleteCartao(cartao.id)}
              />
            ))}
          </div>
        </MobileSection>
      </TabsContent>

      <TabsContent value="parcelamentos" className="mt-0">
        <MobileSection
          title="Contas Parceladas"
          subtitle={`Total Mensal: ${formatCurrency(totalParcelasAtivas)}`}
          icon={Building2}
          iconVariant="warning"
          onAdd={onAddParcelamento}
          addLabel="Adicionar Parcelamento"
          isEmpty={activeContas.length === 0}
          emptyMessage="Nenhum parcelamento ativo"
        >
          <div className="space-y-3">
            {activeContas.map((conta) => (
              <div key={conta.id} className="list-item group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{conta.nome}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-lg font-bold text-warning">
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
                                className={`h-5 text-xs flex items-center gap-1 ${
                                  gasto.pago 
                                    ? "bg-success/10 text-success border-success/20 hover:bg-success/20" 
                                    : "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                                }`}
                              >
                                {gasto.pago ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    {isMobile ? "Ok" : "Pago"}
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3" />
                                    {isMobile ? "Pend" : "Pendente"}
                                  </>
                                )}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {gasto.pago ? (
                                <div className="text-xs">
                                  <p className="font-semibold text-success">✅ Pagamento detectado</p>
                                  {gasto.registroDetectado && (
                                    <>
                                      <p>Valor: {formatCurrency(Math.abs(gasto.registroDetectado.valor))}</p>
                                      <p>Data: {new Date(gasto.registroDetectado.data).toLocaleDateString('pt-BR')}</p>
                                      <p>Categoria: {gasto.registroDetectado.categoria}</p>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-warning">⏰ Aguardando pagamento no mês</p>
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