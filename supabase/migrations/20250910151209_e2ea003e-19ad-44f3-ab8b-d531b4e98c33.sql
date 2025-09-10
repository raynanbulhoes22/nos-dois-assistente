-- Remover as tabelas antigas após migração bem-sucedida para compromissos_financeiros

-- Remover triggers primeiro (se existirem)
DROP TRIGGER IF EXISTS update_cartoes_credito_updated_at ON public.cartoes_credito;
DROP TRIGGER IF EXISTS update_gastos_fixos_updated_at ON public.gastos_fixos;
DROP TRIGGER IF EXISTS update_contas_parceladas_updated_at ON public.contas_parceladas;

-- Remover as tabelas antigas
DROP TABLE IF EXISTS public.cartoes_credito CASCADE;
DROP TABLE IF EXISTS public.gastos_fixos CASCADE;
DROP TABLE IF EXISTS public.contas_parceladas CASCADE;

-- Atualizar o cache de relacionamentos no contexto realtime
COMMENT ON TABLE public.compromissos_financeiros IS 'Tabela unificada que substitui cartoes_credito, gastos_fixos e contas_parceladas';