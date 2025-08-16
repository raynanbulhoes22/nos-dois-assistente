-- Primeiro, vamos limpar todos os registros duplicados de "Saldo Inicial"
-- Estes registros estão causando duplicação pois o saldo já está em orcamentos_mensais.saldo_inicial

DELETE FROM public.registros_financeiros 
WHERE categoria = 'Saldo Inicial';