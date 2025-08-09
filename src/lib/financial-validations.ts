import { z } from "zod";

// Base validation for common fields
const baseFinancialSchema = {
  valor_parcela: z.number().min(0.01, "Valor da parcela deve ser maior que zero"),
  total_parcelas: z.number().min(1, "Total de parcelas deve ser pelo menos 1"),
  data_primeira_parcela: z.string().min(1, "Data da primeira parcela é obrigatória"),
  parcelas_pagas: z.number().min(0).optional(),
  categoria: z.string().optional(),
  debito_automatico: z.boolean().optional(),
  descricao: z.string().optional(),
};

// Financiamento Veicular Schema
export const financiamentoVeicularSchema = z.object({
  // Campos Essenciais (Obrigatórios)
  nome: z.string().min(1, "Modelo do veículo é obrigatório"),
  valor_bem: z.number().min(0.01, "Valor do veículo deve ser maior que zero"),
  valor_financiado: z.number().min(0.01, "Valor financiado deve ser maior que zero"),
  taxa_efetiva_anual: z.number().min(0, "Taxa efetiva anual é obrigatória"),
  ...baseFinancialSchema,
  
  // Campos Importantes (Recomendados)
  ano_veiculo: z.number().min(1990).max(new Date().getFullYear() + 1).optional(),
  taxa_nominal_anual: z.number().min(0).optional(),
  instituicao_financeira: z.string().optional(),
  
  // Campos Opcionais
  valor_entrada: z.number().min(0).optional(),
}).refine((data) => {
  // Validação: valor financiado não pode ser muito maior que valor do bem
  const diferenca = data.valor_financiado - (data.valor_bem - (data.valor_entrada || 0));
  return diferenca <= data.valor_bem * 0.5; // Máximo 50% adicional
}, {
  message: "Valor financiado parece muito alto em relação ao valor do veículo",
  path: ["valor_financiado"]
});

// Parcelamento Schema
export const parcelamentoSchema = z.object({
  // Campos Essenciais (Obrigatórios)
  nome: z.string().min(1, "Nome do produto/serviço é obrigatório"),
  ...baseFinancialSchema,
  
  // Campos Importantes (Recomendados)
  loja: z.string().optional(),
  cartao_id: z.string().optional(),
});

// Empréstimo Schema
export const emprestimoSchema = z.object({
  // Campos Essenciais (Obrigatórios)
  nome: z.string().min(1, "Identificação do empréstimo é obrigatória"),
  valor_emprestado: z.number().min(0.01, "Valor emprestado deve ser maior que zero"),
  taxa_juros: z.number().min(0, "Taxa de juros é obrigatória"),
  ...baseFinancialSchema,
  
  // Campos Importantes (Recomendados)
  instituicao_financeira: z.string().optional(),
  finalidade: z.string().optional(),
  
  // Campos Específicos do Consignado
  margem_consignavel: z.number().min(0).max(100).optional(),
}).refine((data) => {
  // Validação: total das parcelas deve ser coerente com valor emprestado
  const valorTotal = data.valor_parcela * data.total_parcelas;
  const diferenca = valorTotal - data.valor_emprestado;
  return diferenca >= 0 && diferenca <= data.valor_emprestado * 2; // Máximo 200% de juros
}, {
  message: "O valor total das parcelas parece inconsistente com o valor emprestado",
  path: ["valor_parcela"]
});

// Helper para validar campos obrigatórios
export const getRequiredFields = (tipo: string): string[] => {
  switch (tipo) {
    case "financiamento_veicular":
      return ["nome", "valor_bem", "valor_financiado", "valor_parcela", "total_parcelas", "taxa_efetiva_anual", "data_primeira_parcela"];
    case "parcelamento":
      return ["nome", "valor_parcela", "total_parcelas", "data_primeira_parcela"];
    case "emprestimo_pessoal":
    case "emprestimo_consignado":
      return ["nome", "valor_emprestado", "taxa_juros", "valor_parcela", "total_parcelas", "data_primeira_parcela"];
    default:
      return [];
  }
};

// Helper para validar formulário
export const validateForm = (data: any, tipo: string) => {
  try {
    switch (tipo) {
      case "financiamento_veicular":
        return financiamentoVeicularSchema.parse(data);
      case "parcelamento":
        return parcelamentoSchema.parse(data);
      case "emprestimo_pessoal":
      case "emprestimo_consignado":
        return emprestimoSchema.parse(data);
      default:
        throw new Error("Tipo de financiamento inválido");
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(e => e.message).join(", "));
    }
    throw error;
  }
};

export type FinanciamentoVeicularData = z.infer<typeof financiamentoVeicularSchema>;
export type ParcelamentoData = z.infer<typeof parcelamentoSchema>;
export type EmprestimoData = z.infer<typeof emprestimoSchema>;