-- Padronizar datas na tabela compromissos_financeiros
-- Unificar data_inicio e data_vencimento em data_referencia e dia_vencimento

-- Adicionar novas colunas
ALTER TABLE compromissos_financeiros ADD COLUMN data_referencia DATE;
ALTER TABLE compromissos_financeiros ADD COLUMN dia_vencimento INTEGER;

-- Migrar dados existentes preservando a lógica por tipo
UPDATE compromissos_financeiros SET 
  data_referencia = CASE 
    WHEN tipo_compromisso = 'cartao_credito' THEN COALESCE(data_inicio, CURRENT_DATE)
    WHEN tipo_compromisso = 'gasto_fixo' THEN COALESCE(data_inicio, CURRENT_DATE)
    WHEN tipo_compromisso = 'conta_parcelada' THEN COALESCE(data_inicio, CURRENT_DATE)
    ELSE COALESCE(data_inicio, CURRENT_DATE)
  END,
  dia_vencimento = CASE 
    WHEN tipo_compromisso = 'cartao_credito' THEN data_vencimento
    WHEN tipo_compromisso = 'gasto_fixo' THEN COALESCE(data_vencimento, EXTRACT(DAY FROM COALESCE(data_inicio, CURRENT_DATE))::integer)
    ELSE NULL
  END;

-- Remover colunas antigas após migração dos dados
ALTER TABLE compromissos_financeiros DROP COLUMN data_inicio;
ALTER TABLE compromissos_financeiros DROP COLUMN data_vencimento;