-- Adicionar campos de termos de uso na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN terms_accepted boolean NOT NULL DEFAULT false,
ADD COLUMN terms_accepted_at timestamp with time zone,
ADD COLUMN terms_version text;

-- Atualizar usuários existentes para marcar como aceitos (migração)
UPDATE public.profiles 
SET terms_accepted = true, 
    terms_accepted_at = now(),
    terms_version = '1.0'
WHERE terms_accepted = false;