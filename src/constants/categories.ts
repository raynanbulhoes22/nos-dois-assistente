export const FINANCIAL_CATEGORIES = {
  "Essenciais": [
    "Aluguel",
    "Água", 
    "Energia",
    "Internet",
    "Transporte",
    "Combustível",
    "Alimentação",
    "Supermercado",
    "Farmácia",
    "Saúde",
    "Escola / Faculdade"
  ],
  "Parcelamentos & Financiamentos": [
    "Financiamento Veicular",
    "Financiamento Imobiliário",
    "Empréstimo Pessoal", 
    "Empréstimo Consignado",
    "Refinanciamento",
    "Parcelamento de Cartão",
    "Parcelamento de Compra",
    "Consórcio",
    "Leasing",
    "CDC (Crédito Direto ao Consumidor)"
  ],
  "Trabalho / Profissional": [
    "Ferramentas",
    "Software",
    "Internet de trabalho",
    "Freelancers / Terceiros",
    "Transporte de trabalho",
    "Escritório",
    "Impostos / Contador"
  ],
  "Consumo": [
    "Roupas",
    "Calçados", 
    "Eletrodomésticos",
    "Eletrônicos",
    "Compras online",
    "Lojas em geral"
  ],
  "Lazer e Pessoal": [
    "Restaurante",
    "Bar",
    "Cinema / Streaming",
    "Viagens",
    "Presentes",
    "Academia",
    "Estética / Salão",
    "Petshop"
  ],
  "Financeiras": [
    "Transferência (PIX, TED, DOC)",
    "Pagamento de boletos",
    "Cartão de crédito",
    "Empréstimos",
    "Investimentos",
    "Saque em dinheiro",
    "Depósito"
  ],
  "Entradas": [
    "Salário",
    "Pagamento de cliente",
    "Reembolso",
    "Pix recebido",
    "Depósito recebido",
    "Venda realizada"
  ]
} as const;

export const TRANSACTION_TYPES = [
  { value: "Receita", label: "Receita" },
  { value: "Despesa", label: "Despesa" },
  { value: "Transferência", label: "Transferência" }
] as const;

export const PAYMENT_METHODS = [
  "Dinheiro",
  "Cartão de Débito",
  "Cartão de Crédito",
  "PIX",
  "TED",
  "DOC",
  "Boleto",
  "Transferência"
] as const;

export const FINANCING_TYPES = [
  "parcelamento",
  "financiamento_veicular",
  "financiamento_imobiliario", 
  "emprestimo_pessoal",
  "emprestimo_consignado",
  "refinanciamento",
  "consorcio",
  "leasing",
  "cdc"
] as const;

export const FINANCING_TYPE_LABELS = {
  "parcelamento": "Parcelamento",
  "financiamento_veicular": "Financiamento Veicular",
  "financiamento_imobiliario": "Financiamento Imobiliário",
  "emprestimo_pessoal": "Empréstimo Pessoal",
  "emprestimo_consignado": "Empréstimo Consignado", 
  "refinanciamento": "Refinanciamento",
  "consorcio": "Consórcio",
  "leasing": "Leasing",
  "cdc": "CDC"
} as const;