-- Fix Security Definer View issue
-- Drop the existing view
DROP VIEW IF EXISTS public.registros_financeiros_resumo;

-- Recreate the view with proper security
CREATE VIEW public.registros_financeiros_resumo AS
SELECT 
    id,
    user_id,
    data,
    tipo,
    categoria,
    valor,
    tipo_movimento,
    CASE
        WHEN cartao_final IS NOT NULL THEN '****' || RIGHT(cartao_final, 4)
        ELSE NULL
    END AS cartao_mascarado,
    DATE_TRUNC('month', data::timestamp with time zone) AS mes_referencia
FROM registros_financeiros;

-- Enable RLS on the view
ALTER VIEW public.registros_financeiros_resumo SET (security_barrier = true);

-- Add RLS policies to the view
CREATE POLICY "Users can view their own financial records summary" 
ON public.registros_financeiros_resumo
FOR SELECT 
USING (auth.uid() = user_id);