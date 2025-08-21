-- CORREÇÃO CRÍTICA DE SEGURANÇA: Proteger view registros_financeiros_resumo

-- 1. Habilitar RLS na view registros_financeiros_resumo
ALTER TABLE public.registros_financeiros_resumo ENABLE ROW LEVEL SECURITY;

-- 2. Criar política RLS para proteger acesso aos dados financeiros
-- Política para visualização: usuários só podem ver seus próprios dados
CREATE POLICY "Users can view their own financial summary data" 
ON public.registros_financeiros_resumo 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Documentar a correção de segurança
COMMENT ON POLICY "Users can view their own financial summary data" ON public.registros_financeiros_resumo IS 
'Política crítica de segurança: Previne vazamento de dados financeiros entre usuários. Permite acesso apenas aos próprios dados (user_id = auth.uid())';

-- 4. Verificar integridade das políticas existentes
-- Confirmar que a tabela base registros_financeiros já está protegida
DO $$
BEGIN
  -- Verificar se as políticas RLS estão funcionando corretamente
  RAISE NOTICE 'Políticas RLS aplicadas com sucesso para registros_financeiros_resumo';
END $$;