-- Expand profiles table for onboarding data
ALTER TABLE public.profiles 
ADD COLUMN data_nascimento DATE,
ADD COLUMN cpf TEXT,
ADD COLUMN telefone TEXT,
ADD COLUMN telefone_conjuge TEXT,
ADD COLUMN nome_conjuge TEXT,
ADD COLUMN objetivo_principal TEXT,
ADD COLUMN meta_economia_mensal NUMERIC,
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN preferencia_notificacao TEXT;

-- Create fontes_renda table
CREATE TABLE public.fontes_renda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  descricao TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on fontes_renda
ALTER TABLE public.fontes_renda ENABLE ROW LEVEL SECURITY;

-- Create policies for fontes_renda
CREATE POLICY "Users can view their own income sources" 
ON public.fontes_renda 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own income sources" 
ON public.fontes_renda 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own income sources" 
ON public.fontes_renda 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own income sources" 
ON public.fontes_renda 
FOR DELETE 
USING (user_id = auth.uid());

-- Create cartoes_credito table
CREATE TABLE public.cartoes_credito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  apelido TEXT NOT NULL,
  ultimos_digitos TEXT NOT NULL,
  limite NUMERIC,
  dia_vencimento INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on cartoes_credito
ALTER TABLE public.cartoes_credito ENABLE ROW LEVEL SECURITY;

-- Create policies for cartoes_credito
CREATE POLICY "Users can view their own credit cards" 
ON public.cartoes_credito 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own credit cards" 
ON public.cartoes_credito 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own credit cards" 
ON public.cartoes_credito 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own credit cards" 
ON public.cartoes_credito 
FOR DELETE 
USING (user_id = auth.uid());