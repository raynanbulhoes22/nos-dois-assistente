-- Criar tabela para reconciliação de eventos financeiros
CREATE TABLE public.eventos_conciliados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('fonte_renda', 'gasto_fixo', 'conta_parcelada')),
  evento_id UUID NOT NULL,
  mes_referencia INTEGER NOT NULL CHECK (mes_referencia BETWEEN 1 AND 12),
  ano_referencia INTEGER NOT NULL CHECK (ano_referencia >= 2020),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'conciliado', 'atrasado', 'nao_aplicavel')),
  valor_esperado NUMERIC(10,2) NOT NULL,
  valor_real NUMERIC(10,2),
  data_esperada DATE NOT NULL,
  data_real DATE,
  registro_financeiro_id UUID REFERENCES public.registros_financeiros(id) ON DELETE SET NULL,
  confianca_match INTEGER DEFAULT 0 CHECK (confianca_match BETWEEN 0 AND 100),
  criado_manualmente BOOLEAN DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.eventos_conciliados ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios eventos conciliados" 
ON public.eventos_conciliados 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios eventos conciliados" 
ON public.eventos_conciliados 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios eventos conciliados" 
ON public.eventos_conciliados 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios eventos conciliados" 
ON public.eventos_conciliados 
FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_eventos_conciliados_user_mes_ano ON public.eventos_conciliados (user_id, mes_referencia, ano_referencia);
CREATE INDEX idx_eventos_conciliados_tipo_evento ON public.eventos_conciliados (tipo_evento, evento_id);
CREATE INDEX idx_eventos_conciliados_status ON public.eventos_conciliados (status);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_eventos_conciliados_updated_at
  BEFORE UPDATE ON public.eventos_conciliados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();