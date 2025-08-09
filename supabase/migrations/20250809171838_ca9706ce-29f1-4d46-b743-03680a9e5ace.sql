-- Adicionar colunas que podem estar faltando para empréstimos
ALTER TABLE public.contas_parceladas 
ADD COLUMN IF NOT EXISTS valor_emprestado NUMERIC,
ADD COLUMN IF NOT EXISTS finalidade TEXT,
ADD COLUMN IF NOT EXISTS margem_consignavel NUMERIC,
ADD COLUMN IF NOT EXISTS loja TEXT;

-- Comentários para documentar as novas colunas
COMMENT ON COLUMN public.contas_parceladas.valor_emprestado IS 'Valor original do empréstimo';
COMMENT ON COLUMN public.contas_parceladas.finalidade IS 'Finalidade do empréstimo ou parcelamento';
COMMENT ON COLUMN public.contas_parceladas.margem_consignavel IS 'Margem consignável para empréstimos consignados (%)';
COMMENT ON COLUMN public.contas_parceladas.loja IS 'Loja ou estabelecimento do parcelamento';