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
    <div className="space-y-6 animate-fade-in">
      {/* Header Limpo */}
      <div className="text-center space-y-3 px-6">
        <h2 className="text-xl font-semibold text-foreground">
          Selecione o tipo de conta
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Cada tipo possui campos específicos para melhor organização
        </p>
      </div>
      
      {/* Grid Melhorado */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-6 max-h-[50vh] overflow-y-auto">
        {tiposFinanciamento.map((tipo, index) => {
          const Icone = tipo.icone;
          
          return (
            <div 
              key={tipo.id}
              className="animate-scale-in hover-scale group"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <Button
                variant="ghost"
                className={`
                  relative w-full h-auto p-0 overflow-hidden 
                  bg-gradient-to-br ${tipo.bgGradient} 
                  border-2 ${tipo.borderColor}
                  hover:shadow-lg hover:shadow-primary/10
                  hover:border-primary/30 hover:-translate-y-0.5
                  active:translate-y-0 active:scale-98
                  transition-all duration-300 ease-out
                  min-h-[110px] focus-visible:ring-2 focus-visible:ring-primary
                `}
                onClick={() => onSelect(tipo.id)}
                aria-label={`Selecionar ${tipo.nome} - ${tipo.descricao}`}
              >
                {/* Badge Popular */}
                {tipo.popular && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge 
                      variant="secondary" 
                      className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-medium shadow-md"
                    >
                      Popular
                    </Badge>
                  </div>
                )}
                
                <div className="w-full p-4 space-y-3 text-left">
                  {/* Header do Card */}
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-xl bg-gradient-to-br ${tipo.gradient}
                      shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300
                    `}>
                      <Icone className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`
                        font-semibold text-sm leading-tight 
                        ${tipo.textColor} group-hover:scale-105 transition-transform duration-200
                      `}>
                        {tipo.nome}
                      </h3>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed mt-0.5">
                        {tipo.descricao}
                      </p>
                    </div>
                  </div>
                  
                  {/* Campos Essenciais */}
                  <div className="flex flex-wrap gap-1">
                    {tipo.campos.slice(0, 2).map((campo, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-[10px] px-2 py-0.5 bg-white/70 border-white/50 text-muted-foreground font-medium"
                      >
                        {campo}
                      </Badge>
                    ))}
                    {tipo.campos.length > 2 && (
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-2 py-0.5 bg-white/70 border-white/50 text-muted-foreground font-medium"
                      >
                        +{tipo.campos.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Call to Action */}
                  <div className="flex items-center justify-end mt-auto">
                    <ChevronRight className={`
                      h-3.5 w-3.5 ${tipo.textColor} 
                      group-hover:translate-x-1 transition-transform duration-300
                    `} />
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
      
      {/* Footer Simples */}
      <div className="text-center px-4 pt-2">
        <p className="text-xs text-muted-foreground">
          💡 Apenas os campos essenciais para organizar suas contas
        </p>
      </div>
    </div>
  );
};