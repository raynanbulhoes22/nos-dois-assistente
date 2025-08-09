import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Car, 
  Home, 
  HandCoins, 
  CircleDollarSign, 
  RefreshCw,
  Users,
  FileText,
  Calculator,
  ArrowRight
} from "lucide-react";

interface FinanciamentoSelectorProps {
  onSelect: (tipo: string) => void;
}

const tiposFinanciamento = [
  {
    id: "parcelamento",
    nome: "Parcelamento",
    descricao: "Compras parceladas no cartão de crédito",
    icone: CreditCard,
    cor: "bg-blue-500",
    corTexto: "text-blue-600",
    corFundo: "bg-blue-50",
    campos: ["Produto", "Loja", "Cartão", "Parcelas"],
    popular: false
  },
  {
    id: "financiamento_veicular",
    nome: "Financiamento Veicular",
    descricao: "Carros, motos e veículos em geral",
    icone: Car,
    cor: "bg-green-500",
    corTexto: "text-green-600",
    corFundo: "bg-green-50",
    campos: ["Veículo", "Taxa de juros", "Valor do bem", "Entrada"],
    popular: true
  },
  {
    id: "financiamento_imobiliario",
    nome: "Financiamento Imobiliário",
    descricao: "Casa própria e investimentos imobiliários",
    icone: Home,
    cor: "bg-purple-500",
    corTexto: "text-purple-600",
    corFundo: "bg-purple-50",
    campos: ["Imóvel", "Taxa de juros", "Sistema amortização", "Entrada"],
    popular: true
  },
  {
    id: "emprestimo_pessoal",
    nome: "Empréstimo Pessoal",
    descricao: "Empréstimo bancário para uso livre",
    icone: HandCoins,
    cor: "bg-orange-500",
    corTexto: "text-orange-600",
    corFundo: "bg-orange-50",
    campos: ["Finalidade", "Taxa de juros", "Valor emprestado"],
    popular: false
  },
  {
    id: "emprestimo_consignado",
    nome: "Empréstimo Consignado",
    descricao: "Desconto direto na folha de pagamento",
    icone: CircleDollarSign,
    cor: "bg-emerald-500",
    corTexto: "text-emerald-600",
    corFundo: "bg-emerald-50",
    campos: ["Taxa de juros", "Margem consignável", "Valor disponível"],
    popular: false
  },
  {
    id: "refinanciamento",
    nome: "Refinanciamento",
    descricao: "Troque sua dívida por melhores condições",
    icone: RefreshCw,
    cor: "bg-cyan-500",
    corTexto: "text-cyan-600",
    corFundo: "bg-cyan-50",
    campos: ["Taxa anterior", "Nova taxa", "Saldo devedor", "Economia"],
    popular: false
  },
  {
    id: "consorcio",
    nome: "Consórcio",
    descricao: "Conquiste seu bem através de consórcio",
    icone: Users,
    cor: "bg-pink-500",
    corTexto: "text-pink-600",
    corFundo: "bg-pink-50",
    campos: ["Bem", "Taxa administração", "Valor cota", "Lance"],
    popular: false
  },
  {
    id: "leasing",
    nome: "Leasing",
    descricao: "Arrendamento mercantil para empresas",
    icone: FileText,
    cor: "bg-indigo-500",
    corTexto: "text-indigo-600",
    corFundo: "bg-indigo-50",
    campos: ["Bem", "Taxa arrendamento", "VRG", "Opção compra"],
    popular: false
  },
  {
    id: "cdc",
    nome: "CDC",
    descricao: "Crédito direto ao consumidor",
    icone: Calculator,
    cor: "bg-amber-500",
    corTexto: "text-amber-600",
    corFundo: "bg-amber-50",
    campos: ["Produto", "Taxa de juros", "Valor financiado"],
    popular: false
  }
];

export const FinanciamentoSelector: React.FC<FinanciamentoSelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Qual tipo de financiamento?</h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Selecione o tipo para preencher apenas os campos essenciais que impactam sua mensalidade
        </p>
      </div>
      
      {/* Grid de Tipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiposFinanciamento.map((tipo) => {
          const Icone = tipo.icone;
          
          return (
            <Card 
              key={tipo.id} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20 relative overflow-hidden"
              onClick={() => onSelect(tipo.id)}
            >
              {/* Badge Popular */}
              {tipo.popular && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs font-medium">
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6 space-y-4">
                {/* Header do Card */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${tipo.corFundo} ${tipo.cor} shadow-sm`}>
                    <Icone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                      {tipo.nome}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {tipo.descricao}
                    </p>
                  </div>
                </div>
                
                {/* Campos Essenciais */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Campos essenciais
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tipo.campos.map((campo, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-xs font-normal bg-background/50 border-border/50 text-muted-foreground"
                      >
                        {campo}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Call to Action */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${tipo.corTexto} hover:${tipo.corFundo} font-medium group-hover:translate-x-1 transition-all`}
                  >
                    Selecionar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          💡 Focamos apenas nos dados que impactam sua mensalidade e possíveis amortizações
        </p>
      </div>
    </div>
  );
};