import React from "react";
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
  ChevronRight,
  Sparkles
} from "lucide-react";

interface FinanciamentoSelectorProps {
  onSelect: (tipo: string) => void;
}

const tiposFinanciamento = [
  {
    id: "parcelamento",
    nome: "Parcelamento",
    descricao: "Compras parceladas no cartão",
    icone: CreditCard,
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    campos: ["Produto", "Loja", "Cartão"],
    popular: false
  },
  {
    id: "financiamento_veicular",
    nome: "Financiamento Veicular",
    descricao: "Carros, motos e veículos",
    icone: Car,
    gradient: "from-emerald-500 to-green-600",
    bgGradient: "from-emerald-50 to-green-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    campos: ["Veículo", "Taxa de juros", "Entrada"],
    popular: true
  },
  {
    id: "financiamento_imobiliario",
    nome: "Financiamento Imobiliário",
    descricao: "Casa própria e imóveis",
    icone: Home,
    gradient: "from-purple-500 to-violet-600",
    bgGradient: "from-purple-50 to-violet-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    campos: ["Imóvel", "Sistema amortização"],
    popular: true
  },
  {
    id: "emprestimo_pessoal",
    nome: "Empréstimo Pessoal",
    descricao: "Empréstimo para uso livre",
    icone: HandCoins,
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    campos: ["Finalidade", "Taxa de juros"],
    popular: false
  },
  {
    id: "emprestimo_consignado",
    nome: "Empréstimo Consignado",
    descricao: "Desconto na folha",
    icone: CircleDollarSign,
    gradient: "from-teal-500 to-cyan-600",
    bgGradient: "from-teal-50 to-cyan-100",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
    campos: ["Margem consignável"],
    popular: false
  },
  {
    id: "refinanciamento",
    nome: "Refinanciamento",
    descricao: "Melhores condições",
    icone: RefreshCw,
    gradient: "from-cyan-500 to-blue-500",
    bgGradient: "from-cyan-50 to-blue-100",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    campos: ["Taxa anterior", "Nova taxa"],
    popular: false
  },
  {
    id: "consorcio",
    nome: "Consórcio",
    descricao: "Bem através de consórcio",
    icone: Users,
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-50 to-rose-100",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    campos: ["Bem", "Taxa administração"],
    popular: false
  },
  {
    id: "leasing",
    nome: "Leasing",
    descricao: "Arrendamento mercantil",
    icone: FileText,
    gradient: "from-indigo-500 to-purple-600",
    bgGradient: "from-indigo-50 to-purple-100",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    campos: ["Bem", "VRG"],
    popular: false
  },
  {
    id: "cdc",
    nome: "CDC",
    descricao: "Crédito direto ao consumidor",
    icone: Calculator,
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-50 to-orange-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    campos: ["Produto", "Taxa de juros"],
    popular: false
  }
];

export const FinanciamentoSelector: React.FC<FinanciamentoSelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Mobile-First */}
      <div className="text-center space-y-2 px-2">
        <h2 className="text-lg font-semibold text-foreground">
          Selecione o tipo de conta
        </h2>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Cada tipo possui campos específicos para organização
        </p>
      </div>
      
      {/* Layout Mobile-First: Lista vertical no mobile, grid no desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 px-2">
        {tiposFinanciamento.map((tipo, index) => {
          const Icone = tipo.icone;
          
          return (
            <div 
              key={tipo.id}
              className="animate-scale-in hover-scale group"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Button
                variant="ghost"
                className={`
                  relative w-full h-auto p-0 overflow-hidden 
                  bg-gradient-to-br ${tipo.bgGradient} 
                  border-2 ${tipo.borderColor}
                  hover:shadow-md hover:shadow-primary/10
                  hover:border-primary/30 hover:-translate-y-0.5
                  active:translate-y-0 active:scale-98
                  transition-all duration-300 ease-out
                  min-h-[75px] focus-visible:ring-2 focus-visible:ring-primary
                `}
                onClick={() => onSelect(tipo.id)}
                aria-label={`Selecionar ${tipo.nome} - ${tipo.descricao}`}
              >
                
                <div className="w-full p-3 space-y-2 text-left">
                  {/* Header Compacto */}
                  <div className="flex items-center gap-2.5">
                    <div className={`
                      p-1.5 rounded-lg bg-gradient-to-br ${tipo.gradient}
                      shadow-sm group-hover:scale-105 transition-transform duration-300
                    `}>
                      <Icone className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`
                        font-semibold text-sm leading-tight 
                        ${tipo.textColor} group-hover:scale-105 transition-transform duration-200
                      `}>
                        {tipo.nome}
                      </h3>
                      <p className="text-[10px] text-muted-foreground/80 leading-tight mt-0.5">
                        {tipo.descricao}
                      </p>
                    </div>
                    <ChevronRight className={`
                      h-3.5 w-3.5 ${tipo.textColor} 
                      group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0
                    `} />
                  </div>
                  
                  {/* Campos Essenciais - Ultra Compacto */}
                  <div className="flex flex-wrap gap-1">
                    {tipo.campos.slice(0, 2).map((campo, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-[9px] px-1.5 py-0.5 bg-white/70 border-white/50 text-muted-foreground font-medium"
                      >
                        {campo}
                      </Badge>
                    ))}
                    {tipo.campos.length > 2 && (
                      <Badge 
                        variant="outline" 
                        className="text-[9px] px-1.5 py-0.5 bg-white/70 border-white/50 text-muted-foreground font-medium"
                      >
                        +{tipo.campos.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
      
      {/* Footer Compacto */}
      <div className="text-center px-2 pt-1">
        <p className="text-[10px] text-muted-foreground">
          💡 Apenas os campos essenciais para organizar suas contas
        </p>
      </div>
    </div>
  );
};