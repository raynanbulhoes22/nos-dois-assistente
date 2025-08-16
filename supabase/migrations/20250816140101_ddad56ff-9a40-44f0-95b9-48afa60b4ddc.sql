-- Adicionar colunas de status manual para gastos fixos
ALTER TABLE public.gastos_fixos 
ADD COLUMN status_manual TEXT,
ADD COLUMN status_manual_mes INTEGER,
ADD COLUMN status_manual_ano INTEGER;

-- Criar índice para melhor performance na busca por status manual
CREATE INDEX idx_gastos_fixos_status_manual 
ON public.gastos_fixos (user_id, status_manual_mes, status_manual_ano);