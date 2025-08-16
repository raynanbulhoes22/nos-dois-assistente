-- Adicionar colunas de status manual para contas parceladas
ALTER TABLE public.contas_parceladas 
ADD COLUMN status_manual TEXT,
ADD COLUMN status_manual_mes INTEGER,
ADD COLUMN status_manual_ano INTEGER;

-- Criar índice para melhor performance na busca por status manual
CREATE INDEX idx_contas_parceladas_status_manual 
ON public.contas_parceladas (user_id, status_manual_mes, status_manual_ano);