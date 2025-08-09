-- Adicionar colunas que estão faltando na tabela contas_parceladas para financiamento veicular
ALTER TABLE public.contas_parceladas 
ADD COLUMN IF NOT EXISTS ano_veiculo INTEGER;

-- Comentário para documentar a mudança
COMMENT ON COLUMN public.contas_parceladas.ano_veiculo IS 'Ano de fabricação do veículo para financiamentos veiculares';