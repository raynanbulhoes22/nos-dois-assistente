-- Adicionar campo para dados específicos por tipo de financiamento
ALTER TABLE public.contas_parceladas 
ADD COLUMN dados_especificos JSONB DEFAULT '{}'::jsonb;