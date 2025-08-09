import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileSection } from "./MobileSection";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, TrendingUp, CreditCard, Building2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabSectionProps {
  fontes: any[];
  cartoes: any[];
  contas: any[];
  formatCurrency: (value: number) => string;
  totalRendaAtiva: number;
  totalLimiteCartoes: number;
  totalParcelasAtivas: number;
  onEditFonte: (fonte: any) => void;
  onDeleteFonte: (id: string) => void;
  onEditCartao: (cartao: any) => void;
  onDeleteCartao: (id: string) => void;
  onEditContaParcelada: (conta: any) => void;
  onDeleteContaParcelada: (id: string) => void;
  onAddFonte: () => void;
  onAddCartao: () => void;
  onAddParcelamento: () => void;
}

export const TabSection = ({
  fontes,
  cartoes,
  contas,
  formatCurrency,
  totalRendaAtiva,
  totalLimiteCartoes,
  totalParcelasAtivas,
  onEditFonte,
  onDeleteFonte,
  onEditCartao,
  onDeleteCartao,
  onEditContaParcelada,
  onDeleteContaParcelada,
  onAddFonte,
  onAddCartao,
  onAddParcelamento
}: TabSectionProps) => {
  const isMobile = useIsMobile();
  
  const activeFontes = fontes.filter(fonte => fonte.ativa);
  const activeCartoes = cartoes.filter(cartao => cartao.ativo);
  const activeContas = contas.filter(conta => conta.ativa);

  return (
    <Tabs defaultValue="renda" className="w-full">
      <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <TabsTrigger value="renda" className="text-xs sm:text-sm">
          Renda
        </TabsTrigger>
        <TabsTrigger value="cartoes" className="text-xs sm:text-sm">
          Cartões
        </TabsTrigger>
        <TabsTrigger value="parcelamentos" className="text-xs sm:text-sm">
          Parcelados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="renda" className="mt-0">
        <MobileSection
          title="Fontes de Renda"
          subtitle={`Total: ${formatCurrency(totalRendaAtiva)}`}
          icon={TrendingUp}
          iconVariant="success"
          onAdd={onAddFonte}
          addLabel="Adicionar Renda"
          isEmpty={activeFontes.length === 0}
          emptyMessage="Nenhuma fonte de renda cadastrada"
        >
          <div className="space-y-3">
            {activeFontes.map((fonte) => (
              <div key={fonte.id} className="list-item">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{fonte.tipo}</h3>
                    {fonte.descricao && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {fonte.descricao}
                      </p>
                    )}
                    <p className="text-lg font-bold text-success mt-2">
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
          <div className="space-y-3">
            {activeCartoes.map((cartao) => (
              <div key={cartao.id} className="list-item">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{cartao.apelido}</h3>
                    <p className="text-xs text-muted-foreground">
                      Final: •••• {cartao.ultimos_digitos}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                      {cartao.limite && (
                        <p className="text-sm font-semibold text-primary">
                          Limite: {formatCurrency(cartao.limite)}
                        </p>
                      )}
                      {cartao.dia_vencimento && (
                        <p className="text-xs text-muted-foreground">
                          Venc: dia {cartao.dia_vencimento}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 group-hover-actions">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onEditCartao(cartao)} 
                      className="h-8 w-8 p-0 focus-ring"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onDeleteCartao(cartao.id)} 
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
              <div key={conta.id} className="list-item">
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
    </Tabs>
  );
};