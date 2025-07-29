import { z } from 'zod';

export const authSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Digite um email válido')
    .max(255, 'Email muito longo'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .optional(),
});

export const financialRecordSchema = z.object({
  valor: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999999.99, 'Valor muito alto'),
  data: z.date(),
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/, 'Nome contém caracteres inválidos'),
  tipo_movimento: z
    .enum(['entrada', 'saida'], {
      message: 'Tipo de movimento deve ser entrada ou saída'
    })
    .optional(),
  origem: z
    .string()
    .max(255, 'Origem muito longa')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]*$/, 'Origem contém caracteres inválidos')
    .optional(),
  observacao: z
    .string()
    .max(1000, 'Observação muito longa')
    .optional(),
  tipo: z
    .string()
    .max(100, 'Tipo muito longo')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]*$/, 'Tipo contém caracteres inválidos')
    .optional(),
  forma_pagamento: z
    .string()
    .max(100, 'Forma de pagamento muito longa')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]*$/, 'Forma de pagamento contém caracteres inválidos')
    .optional(),
  estabelecimento: z
    .string()
    .max(255, 'Estabelecimento muito longo')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]*$/, 'Estabelecimento contém caracteres inválidos')
    .optional(),
  categoria: z
    .string()
    .max(100, 'Categoria muito longa')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]*$/, 'Categoria contém caracteres inválidos')
    .optional(),
  instituicao: z
    .string()
    .max(255, 'Instituição muito longa')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]*$/, 'Instituição contém caracteres inválidos')
    .optional(),
  cartao_final: z
    .string()
    .max(4, 'Cartão final deve ter no máximo 4 dígitos')
    .regex(/^\d{0,4}$/, 'Cartão final deve conter apenas números')
    .optional(),
  id_transacao: z
    .string()
    .max(255, 'ID da transação muito longo')
    .regex(/^[a-zA-Z0-9\-_]*$/, 'ID da transação contém caracteres inválidos')
    .optional(),
  recorrente: z.boolean().optional(),
});

export type AuthFormData = z.infer<typeof authSchema>;
export type FinancialRecordData = z.infer<typeof financialRecordSchema>;