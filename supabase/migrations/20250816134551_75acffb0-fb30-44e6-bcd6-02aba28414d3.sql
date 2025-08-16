-- Adicionar coluna para status manual nas fontes de renda
ALTER TABLE public.fontes_renda 
ADD COLUMN status_manual TEXT DEFAULT NULL CHECK (status_manual IN ('recebido', 'pendente')),
ADD COLUMN status_manual_mes INTEGER DEFAULT NULL,
ADD COLUMN status_manual_ano INTEGER DEFAULT NULL;