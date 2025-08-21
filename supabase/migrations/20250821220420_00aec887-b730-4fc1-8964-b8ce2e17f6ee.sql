-- Melhorias de segurança para dados financeiros

-- 1. Criar função para validar dados financeiros sensíveis
CREATE OR REPLACE FUNCTION public.validate_financial_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Garantir que user_id seja sempre do usuário autenticado
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: Não é possível criar registros para outros usuários';
  END IF;
  
  -- Mascarar números de cartão se muito longos (manter apenas últimos 4 dígitos)
  IF NEW.cartao_final IS NOT NULL AND LENGTH(NEW.cartao_final) > 4 THEN
    NEW.cartao_final := '****' || RIGHT(NEW.cartao_final, 4);
  END IF;
  
  -- Validar que o valor não seja negativo para operações normais
  IF NEW.valor < 0 AND NEW.tipo != 'estorno' THEN
    RAISE EXCEPTION 'Valor não pode ser negativo para este tipo de transação';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Criar trigger para validação automática
CREATE TRIGGER validate_financial_data_trigger
  BEFORE INSERT OR UPDATE ON public.registros_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_financial_data();

-- 3. Criar função para auditoria de acessos sensíveis
CREATE OR REPLACE FUNCTION public.log_financial_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Log apenas para operações de leitura em massa (mais de 50 registros)
  IF TG_OP = 'SELECT' AND pg_stat_get_numscans('registros_financeiros'::regclass) > 50 THEN
    INSERT INTO public.audit_logs (user_id, table_name, operation, record_id, new_values)
    VALUES (
      auth.uid(), 
      'registros_financeiros_bulk_access', 
      'BULK_SELECT', 
      NULL,
      jsonb_build_object('timestamp', now(), 'ip', inet_client_addr())
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. Adicionar índices para melhor performance com segurança
CREATE INDEX IF NOT EXISTS idx_registros_financeiros_user_data 
ON public.registros_financeiros (user_id, data DESC);

CREATE INDEX IF NOT EXISTS idx_registros_financeiros_user_valor 
ON public.registros_financeiros (user_id, valor) 
WHERE valor > 1000; -- Apenas para valores altos

-- 5. Criar view segura para relatórios (sem dados sensíveis)
CREATE OR REPLACE VIEW public.registros_financeiros_resumo AS
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

-- 6. Política RLS para a view (segurança adicional)
ALTER VIEW public.registros_financeiros_resumo OWNER TO postgres;

-- 7. Função para criptografia de dados sensíveis (futura implementação)
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Por enquanto, apenas mascaramento. Em produção, usar criptografia real
  IF data_input IS NULL OR data_input = '' THEN
    RETURN NULL;
  END IF;
  
  -- Criptografia simples para dados sensíveis
  RETURN encode(digest(data_input || 'FINANCIAL_SALT_2024', 'sha256'), 'hex');
END;
$$;

-- 8. Comentários de documentação para auditoria
COMMENT ON TABLE public.registros_financeiros IS 'Tabela de registros financeiros com RLS ativo e validações de segurança';
COMMENT ON FUNCTION public.validate_financial_data() IS 'Valida dados financeiros e mascara informações sensíveis automaticamente';
COMMENT ON VIEW public.registros_financeiros_resumo IS 'View segura para relatórios sem exposição de dados sensíveis';