-- Create gastos_fixos table for fixed monthly expenses
CREATE TABLE public.gastos_fixos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  categoria TEXT,
  valor_mensal NUMERIC NOT NULL CHECK (valor_mensal > 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gastos_fixos ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own fixed expenses" 
ON public.gastos_fixos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fixed expenses" 
ON public.gastos_fixos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixed expenses" 
ON public.gastos_fixos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixed expenses" 
ON public.gastos_fixos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gastos_fixos_updated_at
BEFORE UPDATE ON public.gastos_fixos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();