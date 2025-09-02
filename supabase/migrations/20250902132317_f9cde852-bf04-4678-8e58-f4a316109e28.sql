-- Habilitar realtime para as tabelas principais
ALTER TABLE public.registros_financeiros REPLICA IDENTITY FULL;
ALTER TABLE public.cartoes_credito REPLICA IDENTITY FULL;
ALTER TABLE public.contas_parceladas REPLICA IDENTITY FULL;
ALTER TABLE public.gastos_fixos REPLICA IDENTITY FULL;
ALTER TABLE public.fontes_renda REPLICA IDENTITY FULL;

-- Adicionar as tabelas ao publication para realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.registros_financeiros;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cartoes_credito;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contas_parceladas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gastos_fixos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fontes_renda;