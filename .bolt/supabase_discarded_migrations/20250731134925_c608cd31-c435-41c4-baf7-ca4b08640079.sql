-- Criar tabela de categorias
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  icone TEXT,
  cor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de cartões
CREATE TABLE public.cartoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  final TEXT NOT NULL,
  limite NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de assinaturas
CREATE TABLE public.assinaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  frequencia TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_inicio DATE NOT NULL,
  proxima_renovacao DATE NOT NULL,
  renovacao_automatica BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de orçamentos mensais
CREATE TABLE public.orcamentos_mensais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  saldo_inicial NUMERIC,
  meta_economia NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes, ano)
);

-- Criar tabela de orçamento por categoria
CREATE TABLE public.orcamento_por_categoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos_mensais(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  valor_orcado NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de dívidas
CREATE TABLE public.dividas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor_total NUMERIC NOT NULL,
  parcelas INTEGER NOT NULL,
  parcelas_pagas INTEGER DEFAULT 0,
  juros NUMERIC DEFAULT 0,
  estrategia TEXT CHECK (estrategia IN ('bola_de_neve', 'avalanche')),
  data_inicio DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo grupo_id para sistema de casal
ALTER TABLE public.profiles ADD COLUMN grupo_id UUID;

-- Atualizar tabela registros_financeiros para incluir novos campos
ALTER TABLE public.registros_financeiros 
ADD COLUMN categoria_id UUID REFERENCES public.categorias(id),
ADD COLUMN parcelado BOOLEAN DEFAULT false,
ADD COLUMN parcelas INTEGER,
ADD COLUMN cartao_id UUID REFERENCES public.cartoes(id),
ADD COLUMN comprovante_url TEXT,
ADD COLUMN fonte TEXT;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_por_categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias
CREATE POLICY "Users can view their own categories and group categories" 
ON public.categorias FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (SELECT grupo_id FROM public.profiles WHERE id = auth.uid()) = 
  (SELECT grupo_id FROM public.profiles WHERE id = user_id)
);

CREATE POLICY "Users can insert their own categories" 
ON public.categorias FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON public.categorias FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON public.categorias FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para cartões
CREATE POLICY "Users can view their own cards and group cards" 
ON public.cartoes FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (SELECT grupo_id FROM public.profiles WHERE id = auth.uid()) = 
  (SELECT grupo_id FROM public.profiles WHERE id = user_id)
);

CREATE POLICY "Users can insert their own cards" 
ON public.cartoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" 
ON public.cartoes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" 
ON public.cartoes FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para assinaturas
CREATE POLICY "Users can view their own subscriptions and group subscriptions" 
ON public.assinaturas FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (SELECT grupo_id FROM public.profiles WHERE id = auth.uid()) = 
  (SELECT grupo_id FROM public.profiles WHERE id = user_id)
);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.assinaturas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.assinaturas FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" 
ON public.assinaturas FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para orçamentos mensais
CREATE POLICY "Users can view their own budgets and group budgets" 
ON public.orcamentos_mensais FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (SELECT grupo_id FROM public.profiles WHERE id = auth.uid()) = 
  (SELECT grupo_id FROM public.profiles WHERE id = user_id)
);

CREATE POLICY "Users can insert their own budgets" 
ON public.orcamentos_mensais FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
ON public.orcamentos_mensais FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
ON public.orcamentos_mensais FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para orçamento por categoria
CREATE POLICY "Users can view their own budget categories" 
ON public.orcamento_por_categoria FOR SELECT 
USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos_mensais 
    WHERE user_id = auth.uid() OR 
    (SELECT grupo_id FROM public.profiles WHERE id = auth.uid()) = 
    (SELECT grupo_id FROM public.profiles WHERE id = user_id)
  )
);

CREATE POLICY "Users can insert their own budget categories" 
ON public.orcamento_por_categoria FOR INSERT 
WITH CHECK (
  orcamento_id IN (
    SELECT id FROM public.orcamentos_mensais WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own budget categories" 
ON public.orcamento_por_categoria FOR UPDATE 
USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos_mensais WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own budget categories" 
ON public.orcamento_por_categoria FOR DELETE 
USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos_mensais WHERE user_id = auth.uid()
  )
);

-- Políticas RLS para dívidas
CREATE POLICY "Users can view their own debts and group debts" 
ON public.dividas FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (SELECT grupo_id FROM public.profiles WHERE id = auth.uid()) = 
  (SELECT grupo_id FROM public.profiles WHERE id = user_id)
);

CREATE POLICY "Users can insert their own debts" 
ON public.dividas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
ON public.dividas FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
ON public.dividas FOR DELETE 
USING (auth.uid() = user_id);

-- Atualizar políticas RLS de registros_financeiros para incluir sistema de casal
DROP POLICY IF EXISTS "Users can view their own financial records" ON public.registros_financeiros;
CREATE POLICY "Users can view their own financial records and group records" 
ON public.registros_financeiros FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (SELECT grupo_id FROM public.profiles WHERE id = auth.uid()) = 
  (SELECT grupo_id FROM public.profiles WHERE id = user_id)
);

-- Inserir categorias padrão
INSERT INTO public.categorias (user_id, nome, tipo, icone) VALUES
(auth.uid(), 'Aluguel', 'saida', '🏠'),
(auth.uid(), 'Água', 'saida', '💧'),
(auth.uid(), 'Energia', 'saida', '⚡'),
(auth.uid(), 'Internet', 'saida', '🌐'),
(auth.uid(), 'Transporte', 'saida', '🚗'),
(auth.uid(), 'Combustível', 'saida', '⛽'),
(auth.uid(), 'Alimentação', 'saida', '🍽️'),
(auth.uid(), 'Supermercado', 'saida', '🛒'),
(auth.uid(), 'Farmácia', 'saida', '💊'),
(auth.uid(), 'Saúde', 'saida', '🏥'),
(auth.uid(), 'Escola / Faculdade', 'saida', '🎓'),
(auth.uid(), 'Salário', 'entrada', '💰'),
(auth.uid(), 'Pagamento de cliente', 'entrada', '💳'),
(auth.uid(), 'Reembolso', 'entrada', '💵'),
(auth.uid(), 'Pix recebido', 'entrada', '📱'),
(auth.uid(), 'Depósito recebido', 'entrada', '🏦'),
(auth.uid(), 'Venda realizada', 'entrada', '🛍️');