import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Lightbulb,
  CreditCard,
  BarChart3,
  Calendar,
  Wallet,
  TrendingUp,
  Settings
} from "lucide-react";

interface HelpCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
}

const helpSections = {
  gettingStarted: {
    title: "Primeiros Passos",
    icon: BookOpen,
    items: [
      {
        title: "Como começar no Lyvo",
        description: "Configure sua conta e personalize sua experiência",
        content: "1. Complete seu perfil no onboarding\n2. Configure suas fontes de renda\n3. Cadastre seus gastos fixos\n4. Registre seus cartões de crédito\n5. Defina seu saldo inicial"
      },
      {
        title: "Configuração inicial",
        description: "Passos essenciais para usar a plataforma",
        content: "Configure primeiro suas informações básicas, depois suas fontes de renda e gastos fixos. Isso permitirá que a plataforma faça projeções mais precisas."
      }
    ]
  },
  dashboard: {
    title: "Dashboard",
    icon: BarChart3,
    items: [
      {
        title: "Entendendo os KPIs",
        description: "Como interpretar seus indicadores financeiros",
        content: "• Receita Total: Soma de todas suas entradas\n• Gastos Totais: Soma de todas suas saídas\n• Saldo Atual: Diferença entre receitas e gastos\n• Projeção: Estimativa baseada em padrões históricos"
      },
      {
        title: "Filtros inteligentes",
        description: "Como usar os filtros para análises específicas", 
        content: "Use os filtros por período, categoria ou tipo de transação para análises mais detalhadas. Combine múltiplos filtros para insights específicos."
      }
    ]
  },
  transactions: {
    title: "Movimentações",
    icon: Wallet,
    items: [
      {
        title: "Cadastrando transações",
        description: "Como registrar entradas e saídas",
        content: "1. Clique em '+' ou use os botões de ação rápida\n2. Selecione o tipo (entrada/saída)\n3. Escolha a categoria apropriada\n4. Defina se é recorrente ou única\n5. Salve e acompanhe no dashboard"
      },
      {
        title: "Transações recorrentes",
        description: "Como gerenciar gastos e receitas fixas",
        content: "Marque como 'recorrente' transações que se repetem mensalmente. O sistema automaticamente criará as próximas ocorrências."
      }
    ]
  },
  calendar: {
    title: "Calendário",
    icon: Calendar,
    items: [
      {
        title: "Visualização temporal",
        description: "Como usar o calendário financeiro",
        content: "O calendário mostra projeções futuras baseadas em seus dados. Clique nos dias para ver detalhes das movimentações planejadas."
      },
      {
        title: "Timeline de projeção",
        description: "Entendendo as cores e indicadores",
        content: "• Verde: Saldo positivo projetado\n• Vermelho: Saldo negativo projetado\n• Amarelo: Saldo próximo ao limite\n• Bolinhas: Representam eventos do dia"
      }
    ]
  },
  cards: {
    title: "Cartões",
    icon: CreditCard,
    items: [
      {
        title: "Gerenciamento de cartões",
        description: "Como cadastrar e monitorar cartões de crédito",
        content: "1. Cadastre seus cartões com limite e vencimento\n2. Registre as compras vinculando ao cartão\n3. Monitore o limite disponível\n4. Acompanhe faturas futuras"
      },
      {
        title: "Faturas futuras",
        description: "Como projetar gastos de cartão",
        content: "O sistema calcula automaticamente suas próximas faturas baseado nas compras registradas. Monitore para evitar surpresas."
      }
    ]
  },
  tips: {
    title: "Dicas e Truques",
    icon: Lightbulb,
    items: [
      {
        title: "Organizando suas finanças",
        description: "Melhores práticas para uso da plataforma",
        content: "• Cadastre primeiro gastos fixos e receitas\n• Use categorias consistentes\n• Revise semanalmente suas projeções\n• Configure alertas para não perder prazos\n• Exporte relatórios mensais"
      },
      {
        title: "Atalhos úteis",
        description: "Funcionalidades que aceleram seu uso",
        content: "• Ctrl/Cmd + N: Nova transação\n• Escape: Fechar modais\n• Use ações rápidas no header\n• Duplique transações similares\n• Use filtros salvos"
      }
    ]
  }
};

export const HelpCenter = ({ open, onOpenChange, initialTab = "gettingStarted" }: HelpCenterProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);

  const filteredSections = Object.entries(helpSections).reduce((acc, [key, section]) => {
    if (!searchTerm) return { ...acc, [key]: section };
    
    const matchingItems = section.items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingItems.length > 0) {
      acc[key] = { ...section, items: matchingItems };
    }
    
    return acc;
  }, {} as typeof helpSections);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Central de Ajuda
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por funcionalidade, dica ou recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {Object.entries(filteredSections).map(([key, section]) => {
              const Icon = section.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs">
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{section.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-4 overflow-y-auto flex-1">
            {Object.entries(filteredSections).map(([key, section]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <section.icon className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                
                <Accordion type="single" collapsible className="space-y-2">
                  {section.items.map((item, index) => (
                    <AccordionItem key={index} value={`${key}-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-sm text-muted-foreground">{item.description}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Card>
                          <CardContent className="pt-4">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                              {item.content}
                            </pre>
                          </CardContent>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Não encontrou o que procura?</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                Suporte
              </Button>
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4 mr-1" />
                Tutoriais
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};