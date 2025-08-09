import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Car, 
  Home, 
  HandCoins, 
  CircleDollarSign, 
  RefreshCw,
  Users,
  FileText,
  Calculator
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
    cor: "text-blue-600",
    campos: ["Produto/serviço", "Loja", "Cartão", "Parcelas"]
  },
  {
    id: "financiamento_veicular",
    nome: "Financiamento Veicular",
    descricao: "Financiamento de carros e motos",
    icone: Car,
    cor: "text-green-600",
    campos: ["Veículo", "Taxa de juros", "Valor do bem", "Entrada"]
  },
  {
    id: "financiamento_imobiliario",
    nome: "Financiamento Imobiliário",
    descricao: "Casa própria e imóveis",
    icone: Home,
    cor: "text-purple-600",
    campos: ["Imóvel", "Taxa de juros", "Sistema amortização", "Entrada"]
  },
  {
    id: "emprestimo_pessoal",
    nome: "Empréstimo Pessoal",
    descricao: "Empréstimo bancário tradicional",
    icone: HandCoins,
    cor: "text-orange-600",
    campos: ["Finalidade", "Taxa de juros", "Valor emprestado"]
  },
  {
    id: "emprestimo_consignado",
    nome: "Empréstimo Consignado",
    descricao: "Desconto direto na folha",
    icone: CircleDollarSign,
    cor: "text-emerald-600",
    campos: ["Taxa de juros", "Margem consignável", "Valor disponível"]
  },
  {
    id: "refinanciamento",
    nome: "Refinanciamento",
    descricao: "Troca de dívida por condições melhores",
    icone: RefreshCw,
    cor: "text-cyan-600",
    campos: ["Taxa anterior", "Nova taxa", "Saldo devedor", "Economia"]
  },
  {
    id: "consorcio",
    nome: "Consórcio",
    descricao: "Bem através de consórcio",
    icone: Users,
    cor: "text-pink-600",
    campos: ["Bem", "Taxa administração", "Valor cota", "Lance"]
  },
  {
    id: "leasing",
    nome: "Leasing",
    descricao: "Arrendamento mercantil",
    icone: FileText,
    cor: "text-indigo-600",
    campos: ["Bem", "Taxa arrendamento", "VRG", "Opção compra"]
  },
  {
    id: "cdc",
    nome: "CDC",
    descricao: "Crédito direto ao consumidor",
    icone: Calculator,
    cor: "text-amber-600",
    campos: ["Produto", "Taxa de juros", "Valor financiado"]
  }
];

export const FinanciamentoSelector: React.FC<FinanciamentoSelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Selecione o Tipo de Financiamento</h3>
        <p className="text-sm text-muted-foreground">
          Cada tipo possui campos específicos para cálculos mais precisos
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiposFinanciamento.map((tipo) => {
          const Icone = tipo.icone;
          
          return (
            <Card key={tipo.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className="w-full h-auto flex flex-col items-start space-y-3 p-0"
                  onClick={() => onSelect(tipo.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-lg bg-secondary ${tipo.cor}`}>
                      <Icone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-sm">{tipo.nome}</h4>
                      <p className="text-xs text-muted-foreground">{tipo.descricao}</p>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground mb-2">Campos essenciais:</p>
                    <div className="flex flex-wrap gap-1">
                      {tipo.campos.map((campo, index) => (
                        <span 
                          key={index}
                          className="inline-block text-xs bg-muted px-2 py-1 rounded"
                        >
                          {campo}
                        </span>
                      ))}
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};