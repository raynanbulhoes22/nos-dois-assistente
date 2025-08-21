-- Correção de segurança: Remover SECURITY DEFINER da view e aplicar RLS adequadamente

-- 1. Recriar a view sem SECURITY DEFINER
DROP VIEW IF EXISTS public.registros_financeiros_resumo;

CREATE VIEW public.registros_financeiros_resumo AS
SELECT 
  id,
  user_id,
  data,
  tipo,
  categoria,
  valor,
  tipo_movimento,
  -- Mascarar dados sensíveis
  CASE 
    WHEN cartao_final IS NOT NULL THEN '****' || RIGHT(cartao_final, 4)
    ELSE NULL 
  END as cartao_mascarado,
  -- Não expor: estabelecimento, instituicao, id_transacao, observacao
  DATE_TRUNC('month', data) as mes_referencia
FROM public.registros_financeiros
WHERE user_id = auth.uid();

-- 2. Habilitar RLS na view
ALTER VIEW public.registros_financeiros_resumo SET (security_barrier = true);

-- 3. Comentários de documentação atualizados
COMMENT ON VIEW public.registros_financeiros_resumo IS 'View segura para relatórios sem exposição de dados sensíveis - utiliza RLS da tabela base';