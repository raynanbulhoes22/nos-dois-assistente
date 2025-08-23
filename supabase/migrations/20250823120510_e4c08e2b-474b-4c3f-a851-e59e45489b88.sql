-- Fix Security Definer View issue properly
-- Drop the existing view
DROP VIEW IF EXISTS public.registros_financeiros_resumo;

-- Create a security definer function to safely get user's financial records summary
CREATE OR REPLACE FUNCTION public.get_registros_financeiros_resumo()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    data date,
    tipo text,
    categoria text,
    valor numeric,
    tipo_movimento text,
    cartao_mascarado text,
    mes_referencia timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        r.id,
        r.user_id,
        r.data,
        r.tipo,
        r.categoria,
        r.valor,
        r.tipo_movimento,
        CASE
            WHEN r.cartao_final IS NOT NULL THEN '****' || RIGHT(r.cartao_final, 4)
            ELSE NULL
        END AS cartao_mascarado,
        DATE_TRUNC('month', r.data::timestamp with time zone) AS mes_referencia
    FROM registros_financeiros r
    WHERE r.user_id = auth.uid();
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_registros_financeiros_resumo() TO authenticated;