-- Remover SECURITY DEFINER desnecessário das funções e manter apenas onde estritamente necessário

-- 1. Recriar função de validação sem SECURITY DEFINER (ela pode funcionar com permissões do usuário)
CREATE OR REPLACE FUNCTION public.validate_financial_data()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- 2. Recriar função de auditoria sem SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.log_financial_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Log apenas para operações específicas, sem precisar de privilégios elevados
  IF TG_OP = 'DELETE' THEN
    -- Log apenas deleções, que são operações críticas
    INSERT INTO public.audit_logs (user_id, table_name, operation, record_id, old_values)
    VALUES (
      auth.uid(), 
      'registros_financeiros_delete', 
      'DELETE', 
      OLD.id,
      jsonb_build_object('valor', OLD.valor, 'data', OLD.data, 'timestamp', now())
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. Manter SECURITY DEFINER apenas nas funções que realmente precisam (encrypt_sensitive_data)
-- Esta função precisa de privilégios elevados para acessar algoritmos de hash
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

-- 4. Adicionar trigger otimizado para log de deleções críticas
DROP TRIGGER IF EXISTS log_financial_access_trigger ON public.registros_financeiros;
CREATE TRIGGER log_financial_access_trigger
  AFTER DELETE ON public.registros_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.log_financial_access();