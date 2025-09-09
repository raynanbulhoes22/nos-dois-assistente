-- Consolidação de dados - Parte 2: Fontes de renda e orçamentos

-- Migrar fontes de renda (verificar duplicatas)
INSERT INTO fontes_renda (user_id, tipo, descricao, valor, ativa, created_at, status_manual_mes, status_manual_ano, status_manual)
SELECT 
  '726bd873-b89f-4716-9f7a-fdba30ddb733' as user_id,
  tipo, 
  descricao, 
  valor, 
  ativa, 
  created_at, 
  status_manual_mes, 
  status_manual_ano, 
  status_manual
FROM fontes_renda 
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3'
AND NOT EXISTS (
  SELECT 1 FROM fontes_renda fr2 
  WHERE fr2.user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
  AND fr2.tipo = fontes_renda.tipo 
  AND COALESCE(fr2.descricao, '') = COALESCE(fontes_renda.descricao, '')
);

-- Migrar orçamentos mensais (verificar duplicatas por mês/ano)
INSERT INTO orcamentos_mensais (user_id, mes, ano, saldo_inicial, meta_economia, created_at, saldo_editado_manualmente)
SELECT 
  '726bd873-b89f-4716-9f7a-fdba30ddb733' as user_id,
  mes,
  ano,
  saldo_inicial,
  meta_economia,
  created_at,
  saldo_editado_manualmente
FROM orcamentos_mensais 
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3'
AND NOT EXISTS (
  SELECT 1 FROM orcamentos_mensais om2 
  WHERE om2.user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
  AND om2.mes = orcamentos_mensais.mes 
  AND om2.ano = orcamentos_mensais.ano
);