-- Add spouse fields to profiles table for couple plan functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telefone_conjuge text,
ADD COLUMN IF NOT EXISTS nome_conjuge text;