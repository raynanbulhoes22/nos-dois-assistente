-- Fix security linter warnings

-- 1. Fix function search paths by adding SET search_path
CREATE OR REPLACE FUNCTION public.validate_user_ownership()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
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

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
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

CREATE OR REPLACE FUNCTION public.encrypt_cpf(cpf_input TEXT)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Simple hash-based encryption for CPF (in production, use proper encryption)
  IF cpf_input IS NULL OR cpf_input = '' THEN
    RETURN NULL;
  END IF;
  
  -- Use SHA-256 hash with salt for CPF encryption
  RETURN encode(digest(cpf_input || 'CPF_SALT_2024', 'sha256'), 'hex');
END;
$$;

-- Update other existing functions to fix search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_phone_number(phone_input text)
RETURNS text 
LANGUAGE plpgsql 
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    cleaned TEXT;
    result TEXT;
BEGIN
    -- Se o input é nulo ou vazio, retorna vazio
    IF phone_input IS NULL OR phone_input = '' THEN
        RETURN '';
    END IF;
    
    -- Remove todos os caracteres não numéricos
    cleaned := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    -- Remove códigos do país duplicados (5555...)
    WHILE cleaned LIKE '5555%' LOOP
        cleaned := substring(cleaned from 3);
    END LOOP;
    
    -- Se não tem código do país, adiciona 55
    IF NOT cleaned LIKE '55%' THEN
        -- Se tem 11 dígitos (DDD + 9 dígitos - remove o 9º dígito)
        IF length(cleaned) = 11 THEN
            result := '55' || substring(cleaned from 1 for 2) || substring(cleaned from 4);
        -- Se tem 10 dígitos (DDD + 8 dígitos - formato correto)
        ELSIF length(cleaned) = 10 THEN
            result := '55' || cleaned;
        -- Se tem 9 dígitos (DDD sem zero + 9 dígitos - remove o 9º)
        ELSIF length(cleaned) = 9 THEN
            result := '551' || substring(cleaned from 1 for 1) || substring(cleaned from 3);
        -- Se tem 8 dígitos (só o número sem DDD)
        ELSIF length(cleaned) = 8 THEN
            result := '5511' || cleaned;
        ELSE
            result := cleaned;
        END IF;
    ELSE
        -- Já tem código do país (55)
        -- Se tem 13 dígitos (55 + DDD + 9 dígitos - remove o 9º dígito)
        IF length(cleaned) = 13 THEN
            result := substring(cleaned from 1 for 4) || substring(cleaned from 6);
        -- Se tem 14 dígitos (duplicação do código do país)
        ELSIF length(cleaned) = 14 THEN
            result := substring(cleaned from 3);
        ELSE
            result := cleaned;
        END IF;
    END IF;
    
    -- Garantir que tem exatamente 12 dígitos e formato válido
    IF length(result) = 12 AND result ~ '^55[1-9][0-9][0-9]{8}$' THEN
        RETURN result;
    END IF;
    
    -- Se não conseguiu normalizar corretamente, retorna o valor original limpo
    RETURN cleaned;
END;
$$;