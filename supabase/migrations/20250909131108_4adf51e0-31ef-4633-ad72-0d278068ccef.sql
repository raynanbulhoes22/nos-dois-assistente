-- Consolidação de dados de usuários duplicados
-- Migrar dados do usuário 4844c935-697d-4b45-b9d0-eeb563cc57f3 para 726bd873-b89f-4716-9f7a-fdba30ddb733

-- 1. Migrar registros financeiros
UPDATE registros_financeiros 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- 2. Migrar fontes de renda (verificar duplicatas por tipo e descrição)
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

-- 3. Migrar orçamentos mensais (verificar duplicatas por mês/ano)
INSERT INTO orcamentos_mensais (user_id, mes, ano, saldo_inicial, meta_economia, created_at, updated_at, saldo_editado_manualmente)
SELECT 
  '726bd873-b89f-4716-9f7a-fdba30ddb733' as user_id,
  mes,
  ano,
  saldo_inicial,
  meta_economia,
  created_at,
  updated_at,
  saldo_editado_manualmente
FROM orcamentos_mensais 
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3'
AND NOT EXISTS (
  SELECT 1 FROM orcamentos_mensais om2 
  WHERE om2.user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
  AND om2.mes = orcamentos_mensais.mes 
  AND om2.ano = orcamentos_mensais.ano
);

-- 4. Migrar categorias de orçamento vinculadas aos orçamentos migrados
INSERT INTO orcamentos_categorias (orcamento_id, categoria_nome, valor_orcado, created_at, updated_at)
SELECT 
  om_new.id as orcamento_id,
  oc.categoria_nome,
  oc.valor_orcado,
  oc.created_at,
  oc.updated_at
FROM orcamentos_categorias oc
JOIN orcamentos_mensais om_old ON om_old.id = oc.orcamento_id
JOIN orcamentos_mensais om_new ON (
  om_new.user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733' 
  AND om_new.mes = om_old.mes 
  AND om_new.ano = om_old.ano
)
WHERE om_old.user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3'
AND NOT EXISTS (
  SELECT 1 FROM orcamentos_categorias oc2
  WHERE oc2.orcamento_id = om_new.id
  AND oc2.categoria_nome = oc.categoria_nome
);

-- 5. Migrar gastos fixos
UPDATE gastos_fixos 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- 6. Migrar contas parceladas
UPDATE contas_parceladas 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- 7. Migrar cartões de crédito
UPDATE cartoes_credito 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- 8. Atualizar logs de auditoria
UPDATE audit_logs 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- 9. Remover dados do usuário antigo após migração
DELETE FROM orcamentos_categorias 
WHERE orcamento_id IN (
  SELECT id FROM orcamentos_mensais 
  WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3'
);

DELETE FROM orcamentos_mensais 
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

DELETE FROM fontes_renda 
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- 10. Remover o perfil duplicado
DELETE FROM profiles 
WHERE id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';