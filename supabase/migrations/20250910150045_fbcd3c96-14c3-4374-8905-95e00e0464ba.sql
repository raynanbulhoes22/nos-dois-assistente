-- Criar a nova tabela unificada compromissos_financeiros
CREATE TABLE public.compromissos_financeiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Tipo de compromisso
  tipo_compromisso TEXT NOT NULL CHECK (tipo_compromisso IN ('cartao_credito', 'gasto_fixo', 'conta_parcelada')),
  
  -- Informações gerais
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  
  -- Valores e datas
  valor_principal NUMERIC,
  data_inicio DATE,
  data_vencimento INTEGER, -- Dia do mês para cartões
  
  -- Parcelamento/Financiamento
  total_parcelas INTEGER,
  parcelas_pagas INTEGER DEFAULT 0,
  
  -- Dados específicos (JSON flexível)
  dados_especificos JSONB DEFAULT '{}',
  
  -- Status manual
  status_manual TEXT,
  status_manual_mes INTEGER,
  status_manual_ano INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.compromissos_financeiros ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own compromissos_financeiros" 
ON public.compromissos_financeiros 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own compromissos_financeiros" 
ON public.compromissos_financeiros 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compromissos_financeiros" 
ON public.compromissos_financeiros 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compromissos_financeiros" 
ON public.compromissos_financeiros 
FOR DELETE 
USING (auth.uid() = user_id);

-- Migrar dados dos cartões de crédito
INSERT INTO public.compromissos_financeiros (
  id,
  user_id,
  tipo_compromisso,
  nome,
  categoria,
  ativo,
  valor_principal,
  data_vencimento,
  dados_especificos,
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  'cartao_credito'::TEXT,
  apelido,
  'Cartão de Crédito'::TEXT,
  ativo,
  COALESCE(limite::NUMERIC, 0),
  dia_vencimento,
  jsonb_build_object(
    'ultimos_digitos', ultimos_digitos,
    'limite_disponivel', limite_disponivel
  ),
  created_at,
  created_at as updated_at
FROM public.cartoes_credito;

-- Migrar dados dos gastos fixos
INSERT INTO public.compromissos_financeiros (
  id,
  user_id,
  tipo_compromisso,
  nome,
  categoria,
  ativo,
  valor_principal,
  data_inicio,
  dados_especificos,
  status_manual,
  status_manual_mes,
  status_manual_ano,
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  'gasto_fixo'::TEXT,
  nome,
  categoria,
  ativo,
  valor_mensal,
  data_inicio,
  jsonb_build_object(
    'observacoes', observacoes
  ),
  status_manual,
  status_manual_mes,
  status_manual_ano,
  created_at,
  updated_at
FROM public.gastos_fixos;

-- Migrar dados das contas parceladas
INSERT INTO public.compromissos_financeiros (
  id,
  user_id,
  tipo_compromisso,
  nome,
  descricao,
  categoria,
  ativo,
  valor_principal,
  data_inicio,
  total_parcelas,
  parcelas_pagas,
  dados_especificos,
  status_manual,
  status_manual_mes,
  status_manual_ano,
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  'conta_parcelada'::TEXT,
  nome,
  descricao,
  categoria,
  ativa,
  valor_parcela,
  data_primeira_parcela,
  total_parcelas,
  parcelas_pagas,
  jsonb_build_object(
    'tipo_financiamento', tipo_financiamento,
    'instituicao_financeira', instituicao_financeira,
    'loja', loja,
    'finalidade', finalidade,
    'taxa_juros', taxa_juros,
    'debito_automatico', debito_automatico,
    'valor_bem', valor_bem,
    'valor_entrada', valor_entrada,
    'valor_financiado', valor_financiado,
    'valor_emprestado', valor_emprestado,
    'margem_consignavel', margem_consignavel,
    'taxa_nominal_anual', taxa_nominal_anual,
    'taxa_efetiva_anual', taxa_efetiva_anual,
    'ano_veiculo', ano_veiculo,
    'cartao_id', cartao_id
  ),
  status_manual,
  status_manual_mes,
  status_manual_ano,
  created_at,
  updated_at
FROM public.contas_parceladas;

-- Criar trigger para updated_at
CREATE TRIGGER update_compromissos_financeiros_updated_at
BEFORE UPDATE ON public.compromissos_financeiros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_compromissos_financeiros_user_id ON public.compromissos_financeiros(user_id);
CREATE INDEX idx_compromissos_financeiros_tipo ON public.compromissos_financeiros(tipo_compromisso);
CREATE INDEX idx_compromissos_financeiros_ativo ON public.compromissos_financeiros(ativo);
CREATE INDEX idx_compromissos_financeiros_user_tipo ON public.compromissos_financeiros(user_id, tipo_compromisso);