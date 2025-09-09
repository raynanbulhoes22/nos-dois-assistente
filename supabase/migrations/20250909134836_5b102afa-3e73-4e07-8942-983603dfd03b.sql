-- Adicionar constraint único para numero_wpp para prevenir fraudes
-- Primeiro, normalizar números existentes usando a função do banco
UPDATE profiles 
SET numero_wpp = normalize_phone_number(numero_wpp) 
WHERE numero_wpp IS NOT NULL AND numero_wpp != '';

-- Criar índice único para numero_wpp (apenas para números não nulos e não vazios)
CREATE UNIQUE INDEX idx_profiles_numero_wpp_unique 
ON profiles (numero_wpp) 
WHERE numero_wpp IS NOT NULL AND numero_wpp != '';

-- Comentário explicativo
COMMENT ON INDEX idx_profiles_numero_wpp_unique IS 'Previne fraudes impedindo reutilização do mesmo WhatsApp por múltiplos usuários';