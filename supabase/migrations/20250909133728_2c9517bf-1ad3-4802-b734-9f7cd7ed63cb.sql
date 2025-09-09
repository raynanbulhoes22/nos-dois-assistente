-- Consolidação de dados - Parte 3: Limpeza dos dados antigos

-- Remover categorias de orçamento do usuário antigo
DELETE FROM orcamentos_categorias 
WHERE orcamento_id IN (
  SELECT id FROM orcamentos_mensais 
  WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3'
);

-- Remover orçamentos mensais antigos
DELETE FROM orcamentos_mensais 
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- Remover fontes de renda antigas
DELETE FROM fontes_renda 
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- Atualizar logs de auditoria
UPDATE audit_logs 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- Remover o perfil duplicado
DELETE FROM profiles 
WHERE id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';