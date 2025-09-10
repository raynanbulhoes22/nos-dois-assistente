-- Primeiro, consolidar os dados existentes
-- Para registros que têm dia_vencimento mas não têm data_referencia
UPDATE compromissos_financeiros 
SET data_referencia = CASE 
  WHEN data_referencia IS NULL AND dia_vencimento IS NOT NULL 
  THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 day' * (dia_vencimento - 1)
  ELSE data_referencia
END
WHERE data_referencia IS NULL AND dia_vencimento IS NOT NULL;

-- Renomear a coluna data_referencia para data_vencimento
ALTER TABLE compromissos_financeiros 
RENAME COLUMN data_referencia TO data_vencimento;

-- Remover a coluna dia_vencimento
ALTER TABLE compromissos_financeiros 
DROP COLUMN dia_vencimento;