-- Phase 1: Critical Database Security Fixes

-- 1. Fix nullable user_id in registros_financeiros - make it NOT NULL
-- First, update any existing records that might have NULL user_id
UPDATE public.registros_financeiros 
SET user_id = p.id 
FROM public.profiles p 
WHERE registros_financeiros.user_id IS NULL 
AND registros_financeiros.nome = p.nome;

-- Delete any orphaned records that can't be linked to a user
DELETE FROM public.registros_financeiros 
WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE public.registros_financeiros 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Add database-level validation function
CREATE OR REPLACE FUNCTION public.validate_user_ownership()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create triggers for data validation on critical tables
CREATE TRIGGER validate_registros_financeiros_ownership
  BEFORE INSERT OR UPDATE ON public.registros_financeiros
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_ownership();

CREATE TRIGGER validate_cartoes_credito_ownership
  BEFORE INSERT OR UPDATE ON public.cartoes_credito
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_ownership();

CREATE TRIGGER validate_gastos_fixos_ownership
  BEFORE INSERT OR UPDATE ON public.gastos_fixos
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_ownership();

CREATE TRIGGER validate_contas_parceladas_ownership
  BEFORE INSERT OR UPDATE ON public.contas_parceladas
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_ownership();

-- 4. Add audit logging function for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs (only readable by the user)
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_registros_financeiros
  AFTER INSERT OR UPDATE OR DELETE ON public.registros_financeiros
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_cartoes_credito
  AFTER INSERT OR UPDATE OR DELETE ON public.cartoes_credito
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 6. Add CPF encryption function
CREATE OR REPLACE FUNCTION public.encrypt_cpf(cpf_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple hash-based encryption for CPF (in production, use proper encryption)
  IF cpf_input IS NULL OR cpf_input = '' THEN
    RETURN NULL;
  END IF;
  
  -- Use SHA-256 hash with salt for CPF encryption
  RETURN encode(digest(cpf_input || 'CPF_SALT_2024', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;