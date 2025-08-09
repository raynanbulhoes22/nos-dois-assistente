-- Adicionar todas as colunas que estão faltando na tabela contas_parceladas para financiamento veicular
ALTER TABLE public.contas_parceladas 
ADD COLUMN IF NOT EXISTS taxa_nominal_anual NUMERIC,
ADD COLUMN IF NOT EXISTS taxa_efetiva_anual NUMERIC,
ADD COLUMN IF NOT EXISTS valor_bem NUMERIC,
ADD COLUMN IF NOT EXISTS valor_entrada NUMERIC,
ADD COLUMN IF NOT EXISTS valor_financiado NUMERIC;

-- Comentários para documentar as novas colunas
COMMENT ON COLUMN public.contas_parceladas.taxa_nominal_anual IS 'Taxa nominal anual do financiamento (%)';
COMMENT ON COLUMN public.contas_parceladas.taxa_efetiva_anual IS 'Taxa efetiva anual do financiamento com todos os custos (%)';
COMMENT ON COLUMN public.contas_parceladas.valor_bem IS 'Valor total do bem financiado';
COMMENT ON COLUMN public.contas_parceladas.valor_entrada IS 'Valor da entrada paga';
COMMENT ON COLUMN public.contas_parceladas.valor_financiado IS 'Valor efetivamente financiado';