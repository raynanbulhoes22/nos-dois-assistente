-- Otimizar funções de segurança: remover SECURITY DEFINER desnecessário

-- 1. Recriar audit_trigger sem SECURITY DEFINER (pode funcionar com permissões normais)
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, table_name, operation, record_id, old_values)
    VALUES (OLD.user_id, TG_TABLE_NAME, TG_OP, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, table_name, operation, record_id, old_values, new_values)
    VALUES (NEW.user_id, TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, table_name, operation, record_id, new_values)
    VALUES (NEW.user_id, TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Recriar validate_user_ownership sem SECURITY DEFINER 
CREATE OR REPLACE FUNCTION public.validate_user_ownership()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Ensure user_id is always set to the authenticated user
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  -- Validate that user_id matches authenticated user
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Cannot create records for other users';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Manter SECURITY DEFINER apenas nas funções críticas que realmente precisam:
-- - handle_new_user (precisa para inserir em profiles durante signup)
-- - create_default_categories_for_user (precisa para criar categorias durante signup)  
-- - encrypt_cpf (precisa para acessar funções de hash)
-- - encrypt_sensitive_data (precisa para acessar funções de hash)

-- 4. Documentar as funções que mantêm SECURITY DEFINER por necessidade
COMMENT ON FUNCTION public.handle_new_user() IS 'Mantém SECURITY DEFINER: necessário para inserir perfil durante signup automático';
COMMENT ON FUNCTION public.create_default_categories_for_user() IS 'Mantém SECURITY DEFINER: necessário para criar categorias durante signup automático';
COMMENT ON FUNCTION public.encrypt_cpf(text) IS 'Mantém SECURITY DEFINER: necessário para acessar funções de hash criptográfico';
COMMENT ON FUNCTION public.encrypt_sensitive_data(text) IS 'Mantém SECURITY DEFINER: necessário para acessar funções de hash criptográfico';