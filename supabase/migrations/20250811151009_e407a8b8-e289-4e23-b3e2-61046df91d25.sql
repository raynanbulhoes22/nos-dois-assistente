
-- Migrar dados existentes de telefone para numero_wpp (onde numero_wpp for null)
UPDATE public.profiles 
SET numero_wpp = telefone 
WHERE numero_wpp IS NULL AND telefone IS NOT NULL;

-- Remover a coluna telefone após migração
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS telefone;
