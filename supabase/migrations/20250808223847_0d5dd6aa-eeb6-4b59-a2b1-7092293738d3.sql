-- Criar tabelas para orçamentos mensais
CREATE TABLE public.orcamentos_mensais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  saldo_inicial NUMERIC DEFAULT 0,
  meta_economia NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes, ano)
);

-- Criar tabela para orçamento por categorias
CREATE TABLE public.orcamentos_categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos_mensais(id) ON DELETE CASCADE,
  categoria_nome TEXT NOT NULL,
  valor_orcado NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(orcamento_id, categoria_nome)
);

-- Enable Row Level Security
ALTER TABLE public.orcamentos_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos_categorias ENABLE ROW LEVEL SECURITY;

-- Create policies for orcamentos_mensais
CREATE POLICY "Users can view their own budgets" 
ON public.orcamentos_mensais 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" 
ON public.orcamentos_mensais 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
ON public.orcamentos_mensais 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
ON public.orcamentos_mensais 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for orcamentos_categorias  
CREATE POLICY "Users can view their own budget categories" 
ON public.orcamentos_categorias 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.orcamentos_mensais WHERE id = orcamento_id));

CREATE POLICY "Users can create their own budget categories" 
ON public.orcamentos_categorias 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.orcamentos_mensais WHERE id = orcamento_id));

CREATE POLICY "Users can update their own budget categories" 
ON public.orcamentos_categorias 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.orcamentos_mensais WHERE id = orcamento_id));

CREATE POLICY "Users can delete their own budget categories" 
ON public.orcamentos_categorias 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.orcamentos_mensais WHERE id = orcamento_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_orcamentos_mensais_updated_at
BEFORE UPDATE ON public.orcamentos_mensais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orcamentos_categorias_updated_at
BEFORE UPDATE ON public.orcamentos_categorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();