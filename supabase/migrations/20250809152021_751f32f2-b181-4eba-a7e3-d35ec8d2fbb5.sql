-- Criar tabela para contas parceladas
CREATE TABLE public.contas_parceladas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_parcela NUMERIC NOT NULL,
  total_parcelas INTEGER NOT NULL,
  parcelas_pagas INTEGER NOT NULL DEFAULT 0,
  data_primeira_parcela DATE NOT NULL,
  categoria TEXT,
  cartao_id UUID,
  descricao TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contas_parceladas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own installment accounts" 
ON public.contas_parceladas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own installment accounts" 
ON public.contas_parceladas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installment accounts" 
ON public.contas_parceladas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installment accounts" 
ON public.contas_parceladas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contas_parceladas_updated_at
BEFORE UPDATE ON public.contas_parceladas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_contas_parceladas_user_id ON public.contas_parceladas(user_id);
CREATE INDEX idx_contas_parceladas_ativa ON public.contas_parceladas(ativa);