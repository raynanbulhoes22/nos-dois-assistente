-- Phase 1: Critical Database Security Fixes

-- 1. Enable RLS on unprotected tables
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_de_interacoes ENABLE ROW LEVEL SECURITY;

-- 2. Add user_id columns to tables that need them
ALTER TABLE public.n8n_chat_histories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.agent_memory ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Create RLS policies for n8n_chat_histories
CREATE POLICY "Users can view their own chat histories" 
ON public.n8n_chat_histories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat histories" 
ON public.n8n_chat_histories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat histories" 
ON public.n8n_chat_histories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat histories" 
ON public.n8n_chat_histories 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create RLS policies for agent_memory
CREATE POLICY "Users can view their own agent memory" 
ON public.agent_memory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent memory" 
ON public.agent_memory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent memory" 
ON public.agent_memory 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent memory" 
ON public.agent_memory 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Create RLS policies for historico_de_interacoes (using existing nome field with profile link)
CREATE POLICY "Users can view their own interaction history" 
ON public.historico_de_interacoes 
FOR SELECT 
USING (nome = (SELECT nome FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own interaction history" 
ON public.historico_de_interacoes 
FOR INSERT 
WITH CHECK (nome = (SELECT nome FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own interaction history" 
ON public.historico_de_interacoes 
FOR UPDATE 
USING (nome = (SELECT nome FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own interaction history" 
ON public.historico_de_interacoes 
FOR DELETE 
USING (nome = (SELECT nome FROM public.profiles WHERE id = auth.uid()));

-- 6. Fix registros_financeiros RLS policies to use user_id instead of nome
-- First, add user_id column to registros_financeiros
ALTER TABLE public.registros_financeiros ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to link to users via profiles table
UPDATE public.registros_financeiros 
SET user_id = p.id 
FROM public.profiles p 
WHERE registros_financeiros.nome = p.nome;

-- Drop old insecure policies
DROP POLICY IF EXISTS "Users can view their own financial records" ON public.registros_financeiros;
DROP POLICY IF EXISTS "Users can insert their own financial records" ON public.registros_financeiros;
DROP POLICY IF EXISTS "Users can update their own financial records" ON public.registros_financeiros;
DROP POLICY IF EXISTS "Users can delete their own financial records" ON public.registros_financeiros;

-- Create new secure policies using user_id
CREATE POLICY "Users can view their own financial records" 
ON public.registros_financeiros 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial records" 
ON public.registros_financeiros 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial records" 
ON public.registros_financeiros 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial records" 
ON public.registros_financeiros 
FOR DELETE 
USING (auth.uid() = user_id);