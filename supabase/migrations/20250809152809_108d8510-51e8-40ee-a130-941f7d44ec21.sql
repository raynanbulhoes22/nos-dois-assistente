-- Add new fields to contas_parceladas table for financing functionality
ALTER TABLE public.contas_parceladas 
ADD COLUMN instituicao_financeira TEXT,
ADD COLUMN taxa_juros NUMERIC,
ADD COLUMN debito_automatico BOOLEAN DEFAULT false,
ADD COLUMN tipo_financiamento TEXT DEFAULT 'parcelamento';

-- Add index for better performance on tipo_financiamento queries
CREATE INDEX idx_contas_parceladas_tipo ON public.contas_parceladas(tipo_financiamento);

-- Update existing records to have default tipo_financiamento
UPDATE public.contas_parceladas 
SET tipo_financiamento = 'parcelamento' 
WHERE tipo_financiamento IS NULL;