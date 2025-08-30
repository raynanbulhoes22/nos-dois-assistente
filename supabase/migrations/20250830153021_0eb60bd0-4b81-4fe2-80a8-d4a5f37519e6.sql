-- Atualizar função handle_new_user para incluir campos de termos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    nome, 
    numero_wpp,
    terms_accepted,
    terms_accepted_at,
    terms_version
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data ->> 'nome',
    NEW.raw_user_meta_data ->> 'numero_wpp',
    COALESCE((NEW.raw_user_meta_data ->> 'terms_accepted')::boolean, false),
    CASE 
      WHEN (NEW.raw_user_meta_data ->> 'terms_accepted_at') IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'terms_accepted_at')::timestamp with time zone
      ELSE NULL
    END,
    NEW.raw_user_meta_data ->> 'terms_version'
  );
  RETURN NEW;
END;
$$;