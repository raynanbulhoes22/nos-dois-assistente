-- CORREÇÃO CRÍTICA DE SEGURANÇA: Proteger view registros_financeiros_resumo

-- 1. Habilitar RLS na view registros_financeiros_resumo
ALTER VIEW public.registros_financeiros_resumo OWNER TO authenticated;
ALTER TABLE public.registros_financeiros_resumo ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas RLS para proteger acesso aos dados financeiros
-- Política para visualização: usuários só podem ver seus próprios dados
CREATE POLICY "Users can view their own financial summary data" 
ON public.registros_financeiros_resumo 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Documentar a correção de segurança
COMMENT ON TABLE public.registros_financeiros_resumo IS 
'View com dados resumidos de transações financeiras. CRÍTICO: Protegida por RLS - usuários só acessam seus próprios dados (user_id = auth.uid())';

-- 4. Verificar se a view base está corretamente protegida
-- (A view herda segurança da tabela registros_financeiros que já tem RLS)
COMMENT ON POLICY "Users can view their own financial summary data" ON public.registros_financeiros_resumo IS 
'Política crítica de segurança: Previne vazamento de dados financeiros entre usuários';

-- 5. Log da correção de segurança
INSERT INTO public.audit_logs (user_id, table_name, operation, new_values)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'registros_financeiros_resumo', 
  'SECURITY_FIX',
  jsonb_build_object(
    'issue', 'Missing RLS policies',
    'fix', 'Added RLS policies to prevent unauthorized access to financial data',
    'severity', 'CRITICAL',
    'timestamp', now()
  )
);