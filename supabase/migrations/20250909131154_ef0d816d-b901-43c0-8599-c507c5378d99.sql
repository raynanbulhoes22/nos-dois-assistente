-- Consolidação de dados simplificada - Parte 1: Migrar registros financeiros
UPDATE registros_financeiros 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- Migrar gastos fixos
UPDATE gastos_fixos 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- Migrar contas parceladas
UPDATE contas_parceladas 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';

-- Migrar cartões de crédito
UPDATE cartoes_credito 
SET user_id = '726bd873-b89f-4716-9f7a-fdba30ddb733'
WHERE user_id = '4844c935-697d-4b45-b9d0-eeb563cc57f3';